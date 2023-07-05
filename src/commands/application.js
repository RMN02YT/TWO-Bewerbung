/**
 * @file application.js
 * @requires node:fs
 * @requires discord.js
 * @exports data
 * @exports execute
 */

import path from 'node:path';
import {readFileSync} from 'node:fs';
// eslint-disable-next-line no-unused-vars
import {SlashCommandBuilder, EmbedBuilder, DMChannel, MessageCollector} from 'discord.js';
import {getDirname} from '../utils.js';

// TODO: add automatic r6api lookup
// TODO: make the embeds look nicer

export const data = new SlashCommandBuilder()
    .setName('apply')
    .setDescription('Bewerbe dich für unseren Clan');

/**
 * Ask the user a question
 * @param {DMChannel} channel
 * @param {Question[]} questions
 * @param {string[]} answers
 * @param {number} i
 * @param {number} timeout
 * @param {BotLogger} logger
 * @param {string} component
 * @return {Promise<void>} A promise that resolves when the question has been asked and answered
 */
export async function askNextQuestion(channel, questions, answers, i, timeout = 60000, logger, component) {
  // send the question
  return Promise.resolve((async () => {
    const question = questions[i];
    const questionEmbed = new EmbedBuilder()
        .setTitle(`Frage ${i + 1}`)
        .setDescription(question.question);
    question.type === 'multiple_choice' ? questionEmbed.addFields({name: 'Antworten', value: question.answers.map((answer, i) => `${i + 1 + '\u20e3'} ${answer}`).join('\n'), inline: false}) : null;
    const mcm = await channel.send({embeds: [questionEmbed]});

    // wait for a response
    if (question.type === 'multiple_choice') {
      // add reactions
      question.answers.forEach(async (_answer, i) => {
        mcm.react(i + 1 + '\u20e3').catch((e) => console.log(e));
      });

      return await (async () => {
        // wait for a reaction
        const response = await mcm.awaitReactions({filter: (r, u) => !u.bot, max: 1, time: timeout, errors: ['time']});
        // If time ran out, we send a message and return, else we add the answer to the answers array
        if (!response) {
          channel.send('Bewerbung abgebrochen, du hast zu lange gebraucht.').catch(console.error);
          return;
        }

        // If we get here, the response is valid, so we add the corresponding answer to the answers array
        answers.push(question.answers[parseInt(response.first().content) - 1]);
      })();
    } else {
      return await (async () => {
        const resp = await channel.awaitMessages({filter: (m) => !m.author.bot, max: 1, time: timeout, errors: ['time']});
        // If either:
        // 1. The response is not the right type
        // 2. The user took too long to respond
        // 3. The user responded with "abbrechen"/"cancel"
        // Then we cancel the application
        // If the user took too long to respond, we send a message and return
        if (!resp.first()) {
          channel.send('Bewerbung abgebrochen, du hast zu lange gebraucht.').catch(console.error);
          return;
        }

        // If the response is not the right type, we ask the question again
        // since text can be anything, and multiple choice is handled with reactions, we only need to check for numbers
        if (question.type == 'number' && isNaN(resp.first().content)) {
          channel.send('Bitte gib eine gültige Zahl ein.').then(()=>{
          // add insert question as next question
            questions.splice(i + 1, 0, question);
          });
          return;
        }

        // If we get here, the response is valid, so we add it to the response array
        // and move on to the next question
        answers.push(resp.first().content);
      })();
    }
  })());
}

/**
 * Executes the command
 * @param {CommandInteraction} i - The interaction that triggered the command
 * @param {BotLogger} logger - The logger for the command
 * @return {Promise<void>} - A promise that resolves when the command is finished executing
 */
export async function execute(i, logger) {
  (async () => {
    const component = 'command';
    const __dirname = getDirname(import.meta.url);

    // first, we confirm the command
    const response = new EmbedBuilder()
        .setTitle('Bewerbung begonnen')
        .setDescription(`${i.user.tag} hat eine Clan Bewerbung gestartet.`);
    await i.reply({embeds: [response]});

    // next we create a dm channel with the user and ask them the questions
    /**
           * @type {DMChannel}
           */
    const slidinIntoThoseDMs = i.user.createDM().then((channel) => {
      logger.info(component, `Created DM channel with ${i.user.tag}`);
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
      const questions = JSON.parse(readFileSync(path.join(__dirname, '../../data/questions.json'), 'utf-8'));
      /**
           * @type {string[]}
           */
      const answers = [];
      logger.info(component, `Read ${questions.length} questions from file`);

      const usermessagefilter = (m) => {
        logger.info(component, `Received message from user ${i.user.tag}: ${m.content}`);
        return m.author.id === true;
      };

      const usermessagecollector = channel.createMessageCollector({filter: usermessagefilter, time: 60000});

      usermessagecollector.on('collect', (m) => {
        logger.info(component, `Collected ${m.content}`);
      });

      usermessagecollector.on('end', (collected) => {
        logger.info(component, `Collected ${collected.size} messages`);
      });
    });


    // ask each question and wait for a response before moving on to the next one
    // timeout is 1 hour
    // const timeout = 60000;
    // for (let i = 0; i < questions.length; i++) {
    //   logger.info(component, `Asking question ${i + 1}`);
    //   askNextQuestion(slidinIntoThoseDMs, questions, answers, i, timeout, logger, component);
    // }

    // once we have all the answers, we ask the user to confirm
    // const confirmEmbed = new EmbedBuilder()
    //     .setTitle('Bewerbung abschließen')
    //     .setDescription('Bist du sicher, dass du deine Bewerbung abschließen möchtest?');
    // const confirm = await slidinIntoThoseDMs.send({embeds: [confirmEmbed]});
    // await confirm.react('✅').then(() => confirm.react('❌'));

    // // wait for a reaction
    // const hasConfirmed = await confirm.awaitReactions({filter: (_reaction, user) => user.id === i.user.id, max: 1, time: 15000, errors: ['time']});

    // // If time ran out, we send a message and return, else we add the answer to the answers array
    // if (!hasConfirmed.first()) {
    //   await slidinIntoThoseDMs.send('Bewerbung abgebrochen, du hast zu lange gebraucht.');
    //   return;
    // }

    // // we don't need to check for cancel here, since the user denying the confirmation is the same as cancelling
    // // So we can check the reactions directly
    // if (hasConfirmed.first().emoji.name === '❌') {
    //   await slidinIntoThoseDMs.send('Bewerbung abgebrochen.');
    //   return;
    // } else if (hasConfirmed.first().emoji.name === '✅') {
    //   // If we get here, the user has confirmed their application, so we send it to the staff channel
    //   const {staffChannelId} = JSON.parse(readFileSync('../data/config.json'));
    //   const staffChannel = await i.client.channels.fetch(staffChannelId);
    //   const applicationEmbed = new EmbedBuilder()
    //       .setTitle('Neue Bewerbung')
    //       .setDescription(`${i.user.tag} hat eine neue Bewerbung abgeschickt.`)
    //       .addField('Antworten', answers.map((answer, i) => `**${questions.map((q) => q.question)[i]}**\n${answer}`).join('\n\n'));
    //   await staffChannel.send({embeds: [applicationEmbed]});

    //   // we also send a confirmation to the user
    //   const confirmationEmbed = new EmbedBuilder()
    //       .setTitle('Bewerbung abgeschickt')
    //       .setDescription('Deine Bewerbung wurde erfolgreich abgeschickt. Wir werden uns so schnell wie möglich bei dir melden.');
    //   await slidinIntoThoseDMs.send({embeds: [confirmationEmbed]});

  //   // and now were done
  //   return;
  //  }
  })();
}

