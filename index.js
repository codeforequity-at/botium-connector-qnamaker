const PluginClass = require('./src/connector')
const { importHandler, importArgs } = require('./src/intents')
const { exportHandler, exportArgs } = require('./src/intents')

module.exports = {
  PluginVersion: 1,
  PluginClass: PluginClass,
  Import: {
    Handler: importHandler,
    Args: importArgs
  },
  Export: {
    Handler: exportHandler,
    Args: exportArgs
  },
  PluginDesc: {
    name: 'QnA Maker',
    provider: 'Microsoft',
    features: {
      intentResolution: true,
      intentConfidenceScore: true
    },
    capabilities: [
      {
        name: 'QNAMAKER_KNOWLEDGEBASE_ID',
        label: 'QnA Maker Knowledgebase ID',
        description: 'In QnA Maker "My knowledge bases", click on "View Code" to see the knowledgebase id - "POST /knowledgebases/xxxxxxxxxxxxxxxxx/generateAnswer" (Copy&Paste the xxxxxx part)',
        type: 'string',
        required: true
      },
      {
        name: 'QNAMAKER_RESOURCE_NAME',
        label: 'QnA Maker Resource Name',
        description: 'In QnA Maker "My knowledge bases", click on "View Code" to see the resource name - "Host: https://xxxxxxxxxxxx.azurewebsites.net/qnamaker" (Copy&Paste the xxxxxx part)',
        type: 'string',
        required: true
      },
      {
        name: 'QNAMAKER_ENDPOINT_KEY',
        label: 'QnA Maker Runtime Key',
        description: 'In QnA Maker "My knowledge bases", click on "View Code" to see the runtime key - "Authorization: EndpointKey xxxxxxxxxxx" (Copy&Paste the xxxxxx part)',
        type: 'secret',
        required: true
      },
      {
        name: 'QNAMAKER_RESOURCE_KEY',
        label: 'QnA Maker Resource Key',
        description: 'In QnA Maker go to your profile, and then select Service settings. You can choose any of the two keys. (only needed if using the Test Case Wizard)',
        type: 'secret',
        required: false
      }
    ]
  }
}
