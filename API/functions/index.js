const functions = require("firebase-functions")
const Alexa = require('alexa-sdk')
const SKILL_ID = 'amzn1.ask.skill.42372c74-2938-40c7-a980-859bbbfa1b28'
const SearchUseCase = require('./api/search_usecase')

const handlers = {
    'LaunchRequest': function() {
        this.emit(':ask', this.t('LAUNCH_RESPONSE'));
    },
    'Unhandled': function() {
        this.emit(':tell', this.t('ERROR_MESSAGE'));
    },
    'SearchIntent':  function () {
        const artist = this.event.request.intent.slots.artist.value;

        if (artist == "Coldplay") {
            this.emit(':tell', this.t(`All Coldplay songs are shit, do you even need to ask!`));
            return
        }

        SearchUseCase.search(artist)
        .then((name) => {
            this.emit(':tell', this.t(`The least popular song by ${artist} is ${name}`));
        })
        .catch(() => {
            this.emit(':tell', this.t(`ERROR_MESSAGE`));
        })
    },
    'ErrorHandling': function() {
        const statusCode = this.attributes['lastError']
        switch(statusCode) {
            case 500: 
                this.emit(':tell', this.t('ERROR_MESSAGE'))
                break
            default:
                this.emit(':tell', this.t('DEFAULT_ERROR'))
                break
        }
    }
}

const languageStrings = {
    'en-GB': {
        translation: {
            ERROR_MESSAGE: 'Oh balls!',
            DEFAULT_ERROR: 'Default Error!',
            LAUNCH_RESPONSE: 'Welcome to Shitify. How can I help?'
        }
    }
}

const app = (req, res) => {
    const alexa = Alexa.handler(req.body, {
        'fail': function(error) {
            res.send(error);
        },
        'succeed': function(data) {
            res.send(data);
        }
    })
    alexa.resources = languageStrings
    alexa.appId = SKILL_ID
    alexa.registerHandlers(handlers)
    alexa.execute()
}

exports.handler = functions.https.onRequest(app)
