# Botium Connector for QnA Maker

[![NPM](https://nodei.co/npm/botium-connector-qnamaker.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/botium-connector-qnamaker/)

[![Codeship Status for codeforequity-at/botium-connector-qnamaker](https://app.codeship.com/projects/b4066c40-c00f-0137-288f-269a2e1d9a5a/status?branch=master)](https://app.codeship.com/projects/365788)
[![npm version](https://badge.fury.io/js/botium-connector-qnamaker.svg)](https://badge.fury.io/js/botium-connector-qnamaker)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()

This is a [Botium](https://github.com/codeforequity-at/botium-core) connector for testing your [QnA Maker](https://www.qnamaker.ai) knowledge base.

__Did you read the [Botium in a Nutshell](https://medium.com/@floriantreml/botium-in-a-nutshell-part-1-overview-f8d0ceaf8fb4) articles? Be warned, without prior knowledge of Botium you won't be able to properly use this library!__

## How it works
Botium connects to the [QnA Maker API](https://docs.microsoft.com/en-us/azure/cognitive-services/qnamaker/).

It can be used as any other Botium connector with all Botium Stack components:
* [Botium CLI](https://github.com/codeforequity-at/botium-cli/)
* [Botium Bindings](https://github.com/codeforequity-at/botium-bindings/)
* [Botium Box](https://www.botium.at)

This connector processes info about NLP intent confidence. So the [intent confidence asserter](https://botium.atlassian.net/wiki/spaces/BOTIUM/pages/17334319/NLP+Asserter+Intents+Entities+Confidence) can be used.

## Requirements
* **Node.js and NPM**
* a **published QnA maker knowledge base**
* a **project directory** on your workstation to hold test cases and Botium configuration

## Install Botium and QnA Maker Connector

When using __Botium CLI__:

```
> npm install -g botium-cli
> npm install -g botium-connector-qnamaker
> botium-cli init
> botium-cli run
```

When using __Botium Bindings__:

```
> npm install -g botium-bindings
> npm install -g botium-connector-qnamaker
> botium-bindings init mocha
> npm install && npm run mocha
```

When using __Botium Box__:

_Already integrated into Botium Box, no setup required_

## Connecting QnA Maker to Botium

You can find everything you need to connect Botium to your QnA Maker knowledge base on the [_My knowledge bases_](https://www.qnamaker.ai/Home/MyServices) screen. Click on _View Code_ to bring up a sample HTTP request to your knowledge base. It looks like this:

```
POST /knowledgebases/xxxxxxxxxxxxx/generateAnswer
Host: https://yyyyyyyyyyy.azurewebsites.net/qnamaker
Authorization: EndpointKey zzzzzzzzzzzzzzzzzzzzz
Content-Type: application/json
{"question":"<Your question>"}
```

The _endpoint_ is composed by the HOST and the URL, for the example above:

    https://yyyyyyyyyyy.azurewebsites.net/qnamaker/knowledgebases/xxxxxxxxxxxxx/generateAnswer

And the _endpoint key_ is the zzzzzzzzzzzzzzzzzzzzz-value from above.


The botium.json file should look something like this:

```
{
  "botium": {
    "Capabilities": {
      "PROJECTNAME": "<whatever>",
      "CONTAINERMODE": "qnamaker",
      "QNAMAKER_ENDPOINT": "https://yyyyyyyyyyy.azurewebsites.net/qnamaker/knowledgebases/xxxxxxxxxxxxx/generateAnswer",
      "QNAMAKER_ENDPOINT_KEY": "zzzzzzzzzzzzzzzzzzzzz"
    }
  }
}
```

To check the configuration, run the emulator (Botium CLI required) to bring up a chat interface in your terminal window:

```
> botium-cli emulator
```

Botium setup is ready, you can begin to write your [BotiumScript](https://botium.atlassian.net/wiki/spaces/BOTIUM/pages/491664/Botium+Scripting+-+BotiumScript) files.

## Supported Capabilities

Set the capability __CONTAINERMODE__ to __qnamaker__ to activate this connector.

### QNAMAKER_ENDPOINT
Endpoint URL, see above

### QNAMAKER_ENDPOINT_KEY
Endpoint key, see above
