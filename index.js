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
        name: 'QNAMAKER_RESOURCE_ENDPOINT',
        label: 'QnA Maker Resource Endpoint',
        description: 'To specify a custom endpoint Url, like https://xxxxxxxxxxxx.azurewebsites.net',
        type: 'url',
        required: false,
        advanced: false
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
        label: 'QnA Maker Authoring/Subscription Key',
        description: 'In the Azure Portal, find these keys on the Cognitive Services resource on the Keys and Endpoint page (only required if using the Test Case Wizard)',
        type: 'secret',
        required: false
      },
      {
        name: 'COGNITIVE_SERVICES_RESOURCE_NAME',
        label: 'Cognitive Services Resource Name',
        description: 'Resource Name for Cognitive Services (only required if using the Test Case Wizard)',
        type: 'string',
        required: false
      },
      {
        name: 'COGNITIVE_SERVICES_RESOURCE_ENDPOINT',
        label: 'Cognitive Services Resource Endpoint',
        description: 'To specify a custom endpoint Url, like https://xxxxxxxxxxxx.cognitiveservices.azure.com',
        type: 'url',
        required: false,
        advanced: false
      }
    ]
  }
}
