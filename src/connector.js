const util = require('util')
const debug = require('debug')('botium-connector-qnamaker')

const SimpleRestContainer = require('botium-core/src/containers/plugins/SimpleRestContainer')
const { Capabilities: CoreCapabilities } = require('botium-core')

const Capabilities = {
  QNAMAKER_ENDPOINT: 'QNAMAKER_ENDPOINT',
  QNAMAKER_ENDPOINT_KEY: 'QNAMAKER_ENDPOINT_KEY'
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

    if (!this.caps[Capabilities.QNAMAKER_ENDPOINT]) throw new Error('Capability QNAMAKER_ENDPOINT required')
    if (!this.caps[Capabilities.QNAMAKER_ENDPOINT_KEY]) throw new Error('Capability QNAMAKER_ENDPOINT_KEY required')

    // default values
    this.delegateCaps = {
      [CoreCapabilities.SIMPLEREST_URL]: this.caps[Capabilities.QNAMAKER_ENDPOINT],
      [CoreCapabilities.SIMPLEREST_METHOD]: 'POST',
      [CoreCapabilities.SIMPLEREST_BODY_TEMPLATE]: '{ "question": "{{msg.messageText}}" }',
      [CoreCapabilities.SIMPLEREST_HEADERS_TEMPLATE]: {
        Authorization: `EndpointKey ${this.caps[Capabilities.QNAMAKER_ENDPOINT_KEY]}`
      },
      [CoreCapabilities.SIMPLEREST_RESPONSE_JSONPATH]: '$.answers[0].answer',
      [CoreCapabilities.SIMPLEREST_RESPONSE_HOOK]: ({ botMsg }) => {
        if (botMsg.sourceData && botMsg.sourceData.answers && botMsg.sourceData.answers.length > 0) {
          botMsg.nlp = {
            intent: {
              confidence: (botMsg.sourceData.answers[0].score || 0) / 100
            }
          }
        }
      }
    }

    this.delegateContainer = new SimpleRestContainer({ queueBotSays: this.queueBotSays, caps: this.delegateCaps })
    debug(`Validate delegateCaps ${util.inspect(this.delegateCaps)}`)
    return this.delegateContainer.Validate()
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
}

module.exports = BotiumConnectorQnAMaker
