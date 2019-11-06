import { spawn } from 'child_process'

import { config } from './config'

// Our Twitter library
import * as Twit from 'twit'
import * as fs from 'fs'

// We need to include our configuration file
var T = new Twit(config)

// This is the URL of a search for the latest tweets on the '#oasis' hashtag.
var oasisSearch: Twit.Params = {
  q: '#oasis',
  count: 10,
  result_type: 'recent',
}

/**
 * This method generates an original tweet from the learned data.
 * It depends on child processes to get a value out of the python
 * script (thank god for async!)
 */
async function generateNewTweet() {
  const newTweet = spawn('python3', ['./script.py'])

  // add a listener for when the script sends data through stdout
  newTweet.stdout.on('data', data => {
    // convert the buffer to a string
    const tweet = data.toString()

    // make request body
    var params = { status: tweet }

    // post to twitter service
    T.post('statuses/update', params)
      .then(() => console.log('Successfully tweeted: "', tweet, '"'))
      .catch(error => console.log(error))
  })

  // clean up the mess we made so we don't get infinite listeners
  newTweet.removeAllListeners()
}
// This function finds the latest tweet with the #mediaarts hashtag, and retweets it.
async function retweetLatest() {
  try {
    // get oasis-tagged tweets
    const { data } = (await T.get('search/tweets', oasisSearch)) as any

    // If our search request to the server had no errors...

    // ...then we grab the ID of the tweet we want to retweet...
    var in_reply_to_status_id = data.statuses[0].id_str
    // and the screen name of the user to whom we are replying
    var in_reply_to_user = data.statuses[0].user.screen_name
    // ...and then we tell Twitter we want to retweet it!

    // split the model file by newlines
    const model = fs
      .readFileSync('./model.txt')
      .toString()
      .split('\n')

    // construct a status with the user we are replying to, and adding a
    // random line from the oasis model file
    const status =
      '@' +
      in_reply_to_user +
      ' ' +
      model[Math.floor(Math.random() * model.length)]

    // post the response
    const response = await T.post('statuses/update', {
      status,
      in_reply_to_status_id,
    })

    // create another tweet that is just original content from the trained model
    generateNewTweet()

    // Let the console know it worked
    if (response)
      console.log(
        'Success! Check your bot, it should have retweeted something.'
      )
  } catch (err) {
    console.log('there was an error: ' + err)
  }
}

// Try to retweet something as soon as we run the program...
retweetLatest()
// ...and then every hour after that. Time here is in milliseconds, so
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 30 = 1/2 hour --> 1000 * 60 * 30
setInterval(retweetLatest, 1000 * 60 * 30)
