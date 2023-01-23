const util = require('util')
const debug = require('debug')('botium-connector-qnamaker')

const SimpleRestContainer = require('botium-core/src/containers/plugins/SimpleRestContainer')
const { Capabilities: CoreCapabilities } = require('botium-core')

const Capabilities = {
  QNAMAKER_KNOWLEDGEBASE_ID: 'QNAMAKER_KNOWLEDGEBASE_ID',
  QNAMAKER_RESOURCE_NAME: 'QNAMAKER_RESOURCE_NAME',
  QNAMAKER_RESOURCE_ENDPOINT: 'QNAMAKER_RESOURCE_ENDPOINT',
  QNAMAKER_ENDPOINT_KEY: 'QNAMAKER_ENDPOINT_KEY',
  QNAMAKER_RESOURCE_KEY: 'QNAMAKER_RESOURCE_KEY'
}

class BotiumConnectorQnAMaker {
  constructor ({ queueBotSays, caps }) {
    this.queueBotSays = queueBotSays
    this.caps = caps
    this.delegateContainer = null
    this.delegateCaps = null
  }

  Validate () {
    debug('Validate called')
    if (!this.caps[Capabilities.QNAMAKER_KNOWLEDGEBASE_ID]) throw new Error('Capability QNAMAKER_KNOWLEDGEBASE_ID required')
    if (!this.caps[Capabilities.QNAMAKER_RESOURCE_NAME]) throw new Error('Capability QNAMAKER_RESOURCE_NAME required')
    if (!this.caps[Capabilities.QNAMAKER_ENDPOINT_KEY]) throw new Error('Capability QNAMAKER_ENDPOINT_KEY required')

    const endpointUrl = `${this.caps[Capabilities.QNAMAKER_RESOURCE_ENDPOINT] || `https://${this.caps[Capabilities.QNAMAKER_RESOURCE_NAME]}.azurewebsites.net`}/qnamaker/knowledgebases/${this.caps[Capabilities.QNAMAKER_KNOWLEDGEBASE_ID]}/generateAnswer`

    // default values
    this.delegateCaps = {
      [CoreCapabilities.SIMPLEREST_URL]: endpointUrl,
      [CoreCapabilities.SIMPLEREST_METHOD]: 'POST',
      [CoreCapabilities.SIMPLEREST_BODY_TEMPLATE]: '{ "question": "{{msg.messageText}}", "top": 5 }',
      [CoreCapabilities.SIMPLEREST_HEADERS_TEMPLATE]: {
        Authorization: `EndpointKey ${this.caps[Capabilities.QNAMAKER_ENDPOINT_KEY]}`
      },
      [CoreCapabilities.SIMPLEREST_RESPONSE_JSONPATH]: '$.answers[0].answer',
      [CoreCapabilities.SIMPLEREST_RESPONSE_HOOK]: ({ botMsg }) => {
        if (botMsg.sourceData && botMsg.sourceData.answers && botMsg.sourceData.answers.length > 0) {
          if (botMsg.sourceData.answers[0].questions.length === 0) {
            botMsg.nlp = {
              intent: {
                incomprehension: true,
                confidence: 1
              }
            }
          } else {
            botMsg.nlp = {
              intent: {
                name: botMsg.sourceData.answers[0].questions[0],
                confidence: (botMsg.sourceData.answers[0].score || 0) / 100,
                intents: botMsg.sourceData.answers.length > 1 ? botMsg.sourceData.answers.slice(1).map(a => ({
                  name: a.questions[0],
                  confidence: (a.score || 0) / 100
                })) : []
              }
            }
          }
        }
      }
    }

    this.delegateContainer = new SimpleRestContainer({ queueBotSays: this.queueBotSays, caps: this.delegateCaps })
    debug(`Validate delegateCaps ${util.inspect(this.delegateCaps)}`)
    return this.delegateContainer.Validate()
  }

  Build () {
    return this.delegateContainer.Build()
  }

  Start () {
    return this.delegateContainer.Start()
  }

  UserSays (msg) {
    return this.delegateContainer.UserSays(msg)
  }

  Stop () {
    return this.delegateContainer.Stop()
  }

  Clean () {
    return this.delegateContainer.Clean()
  }
}

module.exports = BotiumConnectorQnAMaker
