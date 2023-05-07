const fs = require('node:fs');
const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

// TODO: add automatic r6api lookup
// TODO: make the embeds look nicer

module.exports = {
  data: new SlashCommandBuilder()
      .setName('apply')
      .setDescription('Bewerbe dich für unseren Clan'),
  async execute(i) {
    // first, we confirm the command
    const response = new EmbedBuilder()
        .setTitle('Bewerbung begonnen')
        .setDescription(`${i.user.tag} hat eine Clan Bewerbung gestartet.`);
    await i.reply({embeds: [response]});

    // next we create a dm channel with the user and ask them the questions
    /**
         * @type {DMChannel}
         */
    const slidinIntoThoseDMs = await i.user.createDM();

    // load the questions from ../data/questions.json
    /**
         * Questions.json
         * @typedef {Object} Question
         * @property {string} question - The question to ask
         * @property {string} type - The type of question (text, number, multiple choice, etc)
         * @property {string[]} answers - The answers to the question (if multiple choice)
        */

    /**
         * @type {Question[]}
         */
    const questions = JSON.parse(fs.readFileSync('../data/questions.json'));
    /**
         * @type {string[]}
         */
    const answers = [];

    // ask each question and wait for a response before moving on to the next one
    // timeout is 1 hour
    const timeout = 3600000;
    questions.forEach(async (question, i) => {
      // send the question
      const questionEmbed = new EmbedBuilder()
          .setTitle(`Frage ${i + 1}`)
          .setDescription(question.question);
            question.type === 'multiple choice' ? questionEmbed.addField('Antworten', question.answers.join('\n')) : null;
            await slidinIntoThoseDMs.send({embeds: [questionEmbed]});

            // wait for a response
            if (question.type === 'multiple choice') {
              // add reactions
              question.answers.forEach(async (_answer, i) => {
                await slidinIntoThoseDMs.react(i + 1 + '\u20E3');
              });

              // wait for a reaction
              const response = await slidinIntoThoseDMs.awaitReactions({filter: (_reaction, user) => user.id === i.user.id, max: 1, time: timeout, errors: ['time']});

              // If time ran out, we send a message and return, else we add the answer to the answers array
              if (!response.first()) {
                await slidinIntoThoseDMs.send('Bewerbung abgebrochen, du hast zu lange gebraucht.');
                return;
              }

              // If the user wants to cancel, we send a message and return
              if (response.first().content.toLowerCase() === 'abbrechen' || response.first().content.toLowerCase() === 'cancel') {
                await slidinIntoThoseDMs.send('Bewerbung abgebrochen.');
                return;
              }

              // If we get here, the response is valid, so we add the corresponding answer to the answers array
              answers.push(question.answers[parseInt(response.first().content) - 1]);
            } else {
              const response = await slidinIntoThoseDMs.awaitMessages({filter: (m) => m.author.id === i.user.id, max: 1, time: timeout, errors: ['time']});

              // If either:
              // 1. The response is not the right type
              // 2. The user took too long to respond
              // 3. The user responded with "abbrechen"/"cancel"
              // Then we cancel the application

              // If the user took too long to respond, we send a message and return
              if (!response.first()) {
                await slidinIntoThoseDMs.send('Bewerbung abgebrochen, du hast zu lange gebraucht.');
                return;
              }

              // If the user wants to cancel, we send a message and return
              if (response.first().content.toLowerCase() === 'abbrechen' || response.first().content.toLowerCase() === 'cancel') {
                await slidinIntoThoseDMs.send('Bewerbung abgebrochen.');
                return;
              }

              // If the response is not the right type, we ask the question again
              // since text can be anything, and multiple choice is handled with reactions, we only need to check for numbers
              if (question.type == 'number' && isNaN(response.first().content)) {
                await slidinIntoThoseDMs.send('Bitte gib eine gültige Zahl ein.');
                // add insert question as next question
                questions.splice(i + 1, 0, question);
                return;
              }

              // If we get here, the response is valid, so we add it to the response array
              // and move on to the next question
              answers.push(response.first().content);
            }
    });

    // once we have all the answers, we ask the user to confirm
    const confirmEmbed = new EmbedBuilder()
        .setTitle('Bewerbung abschließen')
        .setDescription('Bist du sicher, dass du deine Bewerbung abschließen möchtest?');
    const confirm = await slidinIntoThoseDMs.send({embeds: [confirmEmbed]});
    await confirm.react('✅').then(() => confirm.react('❌'));

    // wait for a reaction
    const hasConfirmed = await confirm.awaitReactions({filter: (_reaction, user) => user.id === i.user.id, max: 1, time: timeout, errors: ['time']});

    // If time ran out, we send a message and return, else we add the answer to the answers array
    if (!hasConfirmed.first()) {
      await slidinIntoThoseDMs.send('Bewerbung abgebrochen, du hast zu lange gebraucht.');
      return;
    }

    // we don't need to check for cancel here, since the user denying the confirmation is the same as cancelling
    // So we can check the reactions directly
    if (hasConfirmed.first().emoji.name === '❌') {
      await slidinIntoThoseDMs.send('Bewerbung abgebrochen.');
      return;
    } else if (hasConfirmed.first().emoji.name === '✅') {
      // If we get here, the user has confirmed their application, so we send it to the staff channel
      const {staffChannelId} = JSON.parse(fs.readFileSync('../data/config.json'));
      const staffChannel = await i.client.channels.fetch(staffChannelId);
      const applicationEmbed = new EmbedBuilder()
          .setTitle('Neue Bewerbung')
          .setDescription(`${i.user.tag} hat eine neue Bewerbung abgeschickt.`)
          .addField('Antworten', answers.map((answer, i) => `**${questions.map((q) => q.question)[i]}**\n${answer}`).join('\n\n'));
      await staffChannel.send({embeds: [applicationEmbed]});

      // we also send a confirmation to the user
      const confirmationEmbed = new EmbedBuilder()
          .setTitle('Bewerbung abgeschickt')
          .setDescription('Deine Bewerbung wurde erfolgreich abgeschickt. Wir werden uns so schnell wie möglich bei dir melden.');
      await slidinIntoThoseDMs.send({embeds: [confirmationEmbed]});

      // and now were done
      return;
    }
  },
};

