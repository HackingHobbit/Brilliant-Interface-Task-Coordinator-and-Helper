import { audioFileToBase64, generateSpeech } from "./piper_tts.js";
import { readJsonTranscript } from "./utils.js"; // Assuming this utility exists
import { identityManager } from "../../ai/agents/identity-manager.js";
import OpenAI from "openai";

const LM_STUDIO_BASE_URL = process.env.LM_STUDIO_BASE_URL || "http://localhost:1234";
const LM_STUDIO_MODEL = process.env.LM_STUDIO_MODEL || "llama-3-8b-lexi-uncensored";

const openai = new OpenAI({
  baseURL: \`\${LM_STUDIO_BASE_URL}/v1\`,
  apiKey: "lm-studio",
});

export async function handleChat(req, res, buildMessagesArray, addToConversationHistory) {
  try {
    const userMessage = req.body.message;
    const sessionId = req.body.sessionId || 'default';

    if (!userMessage) {
      res.send({
        messages: [
          {
            text: "Hello! I am the Brilliant Interface Task Coordinator and Helper, but you can call me your bitch. How can I assist you today?",
            audio: await audioFileToBase64("audios/intro_0.wav"),
            lipsync: await readJsonTranscript("audios/intro_0.json"),
            facialExpression: "smile",
            animation: "Talking_1",
          },
          {
            text: "I am here to help you with tasks, answer questions, and coordinate your digital interface needs. What would you like to work on?",
            audio: await audioFileToBase64("audios/intro_1.wav"),
            lipsync: await readJsonTranscript("audios/intro_1.json"),
            facialExpression: "smile",
            animation: "Talking_2",
          },
        ],
      });
      return;
    }

    console.log("Using fully local setup: LM Studio + Piper TTS + wawa-lipsync");

    const conversationMessages = buildMessagesArray(sessionId, userMessage || "Hello");

    const completion = await openai.chat.completions.create({
      model: LM_STUDIO_MODEL,
      max_tokens: 2000,
      temperature: 0.6,
      messages: conversationMessages,
    });

    let messages;
    try {
      const rawContent = completion.choices[0].message.content;
      console.log('Raw LM Studio response:', rawContent);

      messages = JSON.parse(rawContent);

      if (messages.messages) {
        messages = messages.messages;
      }

      if (!Array.isArray(messages)) {
        messages = [messages];
      }

      console.log('Parsed messages:', messages);
    } catch (error) {
      console.error('Failed to parse LM Studio response as JSON:', error);
      console.log('Raw response:', completion.choices[0].message.content);

      const rawContent = completion.choices[0].message.content;
      const jsonMatch = rawContent.match(/\\[[\\s\\S]*\\]/);

      if (jsonMatch) {
        try {
          messages = JSON.parse(jsonMatch[0]);
          console.log('Extracted JSON successfully:', messages);
        } catch (extractError) {
          console.error('Failed to extract complete JSON array:', extractError);

          try {
            const objectMatches = rawContent.match(/\\{[\\s\\S]*?\\}/g);
            if (objectMatches && objectMatches.length > 0) {
              messages = objectMatches.map(objStr => {
                try {
                  return JSON.parse(objStr);
                } catch (e) {
                  return {
                    text: objStr,
                    facialExpression: "default",
                    animation: "Talking_0"
                  };
                }
              });
              console.log('Extracted individual JSON objects:', messages);
            } else {
              throw new Error('No valid JSON objects found');
            }
          } catch (objError) {
            console.error('Failed to extract individual JSON objects:', objError);
            messages = [
              {
                text: rawContent || "I'm having trouble understanding right now, but I'm here for you!",
                facialExpression: "smile",
                animation: "Talking_1"
              }
            ];
          }
        }
      } else {
        messages = [
          {
            text: rawContent || "I'm having trouble understanding right now, but I'm here for you!",
            facialExpression: "smile",
            animation: "Talking_1"
          }
        ];
      }
    }

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      if (message.text && (message.text.includes('"facialExpression"') || message.text.includes('"animation"') || message.text.includes('"text"'))) {
        console.warn(`Message ${i} text contains JSON structure, cleaning up...`);

        let cleanedText = message.text;

        if (cleanedText.trim().startsWith('[') || cleanedText.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(cleanedText);
            if (Array.isArray(parsed) && parsed[0] && parsed[0].text) {
              cleanedText = parsed[0].text;
            } else if (parsed.text) {
              cleanedText = parsed.text;
            }
          } catch (e) {
            const textMatch = cleanedText.match(/"text":\s*"([^"]+)"/);
            if (textMatch) {
              cleanedText = textMatch[1];
            } else {
              cleanedText = cleanedText.split(/[\{\[]/)[0].trim();
            }
          }
        }

        cleanedText = cleanedText
          .replace(/\n/g, ' ')
          .replace(/\t/g, ' ')
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanedText && cleanedText !== message.text) {
          message.text = cleanedText;
          console.log(`Cleaned text for message ${i}: "${message.text}"`);
        }
      }

      if (message.text) {
        message.text = message.text
          .replace(/don't/gi, 'do not')
          .replace(/can't/gi, 'cannot')
          .replace(/won't/gi, 'will not')
          .replace(/shouldn't/gi, 'should not')
          .replace(/wouldn't/gi, 'would not')
          .replace(/couldn't/gi, 'could not')
          .replace(/isn't/gi, 'is not')
          .replace(/aren't/gi, 'are not')
          .replace(/wasn't/gi, 'was not')
          .replace(/weren't/gi, 'were not')
          .replace(/hasn't/gi, 'has not')
          .replace(/haven't/gi, 'have not')
          .replace(/hadn't/gi, 'had not')
          .replace(/doesn't/gi, 'does not')
          .replace(/didn't/gi, 'did not')
          .replace(/I'm/gi, 'I am')
          .replace(/you're/gi, 'you are')
          .replace(/we're/gi, 'we are')
          .replace(/they're/gi, 'they are')
          .replace(/he's/gi, 'he is')
          .replace(/she's/gi, 'she is')
          .replace(/it's/gi, 'it is')
          .replace(/that's/gi, 'that is')
          .replace(/there's/gi, 'there is')
          .replace(/here's/gi, 'here is')
          .replace(/what's/gi, 'what is')
          .replace(/where's/gi, 'where is')
          .replace(/who's/gi, 'who is')
          .replace(/how's/gi, 'how is')
          .replace(/I'll/gi, 'I will')
          .replace(/you'll/gi, 'you will')
          .replace(/he'll/gi, 'he will')
          .replace(/she'll/gi, 'she will')
          .replace(/we'll/gi, 'we will')
          .replace(/they'll/gi, 'they will')
          .replace(/I've/gi, 'I have')
          .replace(/you've/gi, 'you have')
          .replace(/we've/gi, 'we have')
          .replace(/they've/gi, 'they have')
          .replace(/I'd/gi, 'I would')
          .replace(/you'd/gi, 'you would')
          .replace(/he'd/gi, 'he would')
          .replace(/she'd/gi, 'she would')
          .replace(/we'd/gi, 'we would')
          .replace(/they'd/gi, 'they would')
          .replace(/'/g, '')
          .replace(/'/g, '')
          .replace(/'/g, '')
          .replace(/"/g, '')
          .replace(/"/g, '')
          .replace(/"/g, '"')
          .replace(/…/g, '...')
          .replace(/–/g, '-')
          .replace(/—/g, ' - ')
          .replace(/\s+/g, ' ')
          .trim();

        console.log(`Final text for TTS (message ${i}): "${message.text}"`);
      }

      const fileName = `audios/message_${i}.wav`;
      const textInput = message.text;

      try {
        console.log(`Calling generateSpeech for message ${i} with text: "${textInput}"`);
        await generateSpeech(textInput, fileName);
        console.log(`generateSpeech succeeded for message ${i}`);
        message.audio = await audioFileToBase64(fileName);
        console.log(`audioFileToBase64 succeeded for message ${i}, audio length: ${message.audio ? message.audio.length : 0}`);
        message.lipsync = null;
        console.log(`Generated audio for message ${i}: ${textInput.substring(0, 50)}...`);
      } catch (error) {
        console.error(`Failed to generate speech for message ${i}:`, error);
        message.audio = null;
        message.lipsync = null;
      }
    }

    addToConversationHistory(sessionId, userMessage, messages);

    res.send({ messages });

  } catch (error) {
    console.error('❌ Error in chat endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing your request. Please try again.'
    });
  }
});
</replace_in_file>
