const request = require('request-promise-native')
const botium = require('botium-core')
const debug = require('debug')('botium-connector-qnamaker-intents')

const getCaps = (caps) => {
  const result = caps || {}
  return result
}

const waitOperationReady = async (ccaps, operationId, interval) => {
  const timeout = ms => new Promise(resolve => setTimeout(resolve, ms))
  while (true) {
    try {
      const requestOptions = {
        uri: `https://${ccaps.QNAMAKER_RESOURCE_NAME}.cognitiveservices.azure.com/qnamaker/v4.0/operations/${operationId}`,
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': ccaps.QNAMAKER_RESOURCE_KEY
        },
        json: true
      }
      const operationResponse = await request(requestOptions)
      debug(`Qna Maker checking operation status ${operationId}: ${operationResponse.operationState}`)
      if (operationResponse.operationState === 'Succeeded' || operationResponse.operationState === 'Failed') {
        return operationResponse
      }
    } catch (err) {
      debug(`QnA Maker error on operation check ${err.message}`)
    }
    await timeout(interval || 5000)
  }
}

const importIntents = async ({ caps, buildconvos }) => {
  const driver = new botium.BotDriver(getCaps(caps))

  const ccaps = driver.caps
  if (!ccaps.QNAMAKER_RESOURCE_KEY) {
    throw new Error('FAILED: QnA Maker Resource Key not configured!')
  }

  const convos = []
  const utterances = []

  const requestOptions = {
    uri: `https://${ccaps.COGNITIVE_SERVICES_RESOURCE_NAME || ccaps.QNAMAKER_RESOURCE_NAME}.cognitiveservices.azure.com/qnamaker/v4.0/knowledgebases/${ccaps.QNAMAKER_KNOWLEDGEBASE_ID}/test/qna`,
    method: 'GET',
    headers: {
      'Ocp-Apim-Subscription-Key': ccaps.QNAMAKER_RESOURCE_KEY
    },
    json: true
  }
  const qnaResponse = await request(requestOptions)

  debug(`QnA Maker got ${qnaResponse.qnaDocuments.length} QnA Pairs`)

  for (const intent of qnaResponse.qnaDocuments) {
    const intentName = intent.questions[0]
    const inputUtterances = intent.questions

    utterances.push({
      name: intentName,
      utterances: inputUtterances
    })

    if (buildconvos) {
      const convo = {
        header: {
          name: intentName
        },
        conversation: [
          {
            sender: 'me',
            messageText: intentName
          },
          {
            sender: 'bot',
            messageText: intent.answer,
            asserters: [
              {
                name: 'INTENT',
                args: [intentName]
              }
            ]
          }
        ]
      }
      convos.push(convo)
    }
  }

  return { convos, utterances }
}

const exportIntents = async ({ caps, overwrite, waitforready }, { convos, utterances }, { statusCallback }) => {
  const driver = new botium.BotDriver(getCaps(caps))

  const ccaps = driver.caps
  if (!ccaps.QNAMAKER_RESOURCE_KEY) {
    throw new Error('FAILED: QnA Maker Resource Key not configured!')
  }

  const status = (log, obj) => {
    debug(log, obj)
    if (statusCallback) statusCallback(log, obj)
  }

  const requestOptions = {
    uri: `https://${ccaps.COGNITIVE_SERVICES_RESOURCE_NAME || ccaps.QNAMAKER_RESOURCE_NAME}.cognitiveservices.azure.com/qnamaker/v4.0/knowledgebases/${ccaps.QNAMAKER_KNOWLEDGEBASE_ID}/test/qna`,
    method: 'GET',
    headers: {
      'Ocp-Apim-Subscription-Key': ccaps.QNAMAKER_RESOURCE_KEY
    },
    json: true
  }
  const qnaResponse = await request(requestOptions)

  status(`QnA Maker downloaded ${qnaResponse.qnaDocuments.length} QnA Pairs`)

  const updatedDocuments = []
  const addedDocuments = []

  for (const utt of utterances) {
    const qnaDocument = qnaResponse.qnaDocuments.find(i => i.questions[0] === utt.name)
    if (qnaDocument) {
      if (overwrite) {
        status(`Overwriting question "${utt.name}" with ${utt.utterances.length + 1} user examples`)
        const newExamples = [utt.name, ...utt.utterances]
        updatedDocuments.push({
          id: qnaDocument.id,
          questions: {
            add: newExamples,
            delete: qnaDocument.questions.filter(q => !newExamples.includes(q))
          }
        })
      } else {
        const newExamples = utt.utterances.filter(ex => !qnaDocument.questions.includes(ex))
        if (newExamples.length > 0) {
          status(`Found ${newExamples.length} new user examples for question "${utt.name}"`)
          updatedDocuments.push({
            id: qnaDocument.id,
            questions: {
              add: newExamples
            }
          })
        }
      }
    } else {
      status(`Question "${utt.name}" not found in knowledge base, adding new question.`)
      addedDocuments.push({
        id: 0,
        answer: utt.name,
        questions: [utt.name, ...utt.utterances],
        source: 'Botium'
      })
    }
  }

  if (updatedDocuments.length > 0 || addedDocuments.length > 0) {
    status(`Uploading ${updatedDocuments.length} changed and adding ${addedDocuments.length} QnA documents`)

    const body = {
      add: {
        qnaList: addedDocuments
      },
      update: {
        qnaList: updatedDocuments
      }
    }
    const updateOptions = {
      uri: `https://${ccaps.QNAMAKER_RESOURCE_NAME}.cognitiveservices.azure.com/qnamaker/v4.0/knowledgebases/${ccaps.QNAMAKER_KNOWLEDGEBASE_ID}`,
      method: 'PATCH',
      headers: {
        'Ocp-Apim-Subscription-Key': ccaps.QNAMAKER_RESOURCE_KEY
      },
      json: body
    }
    const updateResponse = await request(updateOptions)
    if (updateResponse && updateResponse.operationId && waitforready) {
      status(`Waiting for QnA Maker upload (Operation ${updateResponse.operationId}) to finish`)
      await waitOperationReady(ccaps, updateResponse.operationId)
      status(`QnA Maker (Operation ${updateResponse.operationId}) is ready for use`)
    }
  } else {
    status('No changed QnA documents found')
  }

  return { }
}

module.exports = {
  importHandler: ({ caps, buildconvos, ...rest } = {}) => importIntents({ caps, buildconvos, ...rest }),
  importArgs: {
    caps: {
      describe: 'Capabilities',
      type: 'json',
      skipCli: true
    },
    buildconvos: {
      describe: 'Build convo files for intent assertions (otherwise, just write utterances files)',
      type: 'boolean',
      default: false
    }
  },
  exportHandler: ({ caps, overwrite, waitforready, ...rest } = {}, { convos, utterances } = {}, { statusCallback } = {}) => exportIntents({ caps, overwrite, waitforready, ...rest }, { convos, utterances }, { statusCallback }),
  exportArgs: {
    caps: {
      describe: 'Capabilities',
      type: 'json',
      skipCli: true
    },
    overwrite: {
      describe: 'Overwrite QnA Maker questions lists',
      type: 'boolean',
      default: false
    },
    waitforready: {
      describe: 'Wait until QnA Maker operation finished',
      type: 'boolean',
      default: false
    }
  }
}
