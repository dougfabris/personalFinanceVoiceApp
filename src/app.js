'use strict';

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { GoogleAssistant } = require('jovo-platform-googleassistant');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const app = new App();

app.use(
  new Alexa(),
  new GoogleAssistant(),
  new JovoDebugger(),
  new FileDb()
);

// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

function randomNumber () {
  return Math.floor((Math.random() * 10000) + 1);
}

app.setHandler({
  getAccounts () {
    return this.$user.$data.accounts;
  },

  addAccount (accountName) {
    const accounts = this.getAccounts();
    const newAccounts = [...accounts, { id: randomNumber(), accountName }]
    return this.$user.$data.accounts = newAccounts;
  },

  LAUNCH() {
    return this.toIntent('WelcomeIntent');
  },

  WelcomeIntent() {
    this.ask("Welcome to the personal finance app, how can I help you?");
  },

  CreateAccountIntent() {
    this.tell("Nice, let's create your account");
    this.ask("What's the name of the account?");
  }, 

  AccountNameIntent() {
    const accountName = this.$inputs.accountName.value;
    const accounts = this.getAccounts();
    const myAccounts = accounts.map((item) => accountName !== item.accountName);
    if (myAccounts.includes(false)) {
      return this.toIntent('AccountNameExists');
    }

    this.addAccount(accountName)
    return this.tell('Ok, ' + accountName + ' was created');
  },

  AccountNameExists() {
    this.tell("This account name already exists! Try another name.");
  },

  ListAccountIntent() {
    if (this.getAccounts().length !== 0) {
      let speech = 'Here is your account list: ';
      const complement = this.getAccounts().map((item, index) => `Account: ${index}: ${item.accountName}`); 
      const listAccounts = complement.toString();
      return this.tell(speech+listAccounts);
    }
    
    return this.tell("There's no accounts");
  },

  Unhandled() {
    return this.tell("Sorry I couldn't understand what you need, let's try again").toIntent("WelcomeIntent");
 },
});

module.exports = { app };
