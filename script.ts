import { spawn } from 'child_process'

import { config } from './config'

// Our Twitter library
import * as Twit from 'twit'
import * as fs from 'fs'

// We need to include our configuration file
var T = new Twit(config)

// This is the URL of a search for the latest tweets on the '#mediaarts' hashtag.
var oasisSearch: Twit.Params = {
  q: '#oasis',
  count: 10,
  result_type: 'recent',
}

async function generateNewTweet() {
  const newTweet = spawn('python3', ['./script.py'])
  newTweet.stdout.on('data', data => {
    const tweet = data.toString()
    var params = { status: tweet }
    T.post('statuses/update', params, function(error, tweets, response) {
      if (!error) {
        console.log('tweet successful')
        console.log('said: ', tweet)
      } else {
        console.log(error)
      }
    })
  })

  newTweet.removeAllListeners()
}
// This function finds the latest tweet with the #mediaarts hashtag, and retweets it.
async function retweetLatest() {
  try {
    const { data } = (await T.get('search/tweets', oasisSearch)) as any

    // If our search request to the server had no errors...

    // ...then we grab the ID of the tweet we want to retweet...
    console.log(data.statuses)
    var in_reply_to_status_id = data.statuses[0].id_str
    var in_reply_to_user = data.statuses[0].user.screen_name
    // ...and then we tell Twitter we want to retweet it!

    const model = fs
      .readFileSync('./model.txt')
      .toString()
      .split('\n')

    const status =
      '@' +
      in_reply_to_user +
      ' ' +
      model[Math.floor(Math.random() * model.length)]

    const response = await T.post('statuses/update', {
      status,
      in_reply_to_status_id,
    })

    generateNewTweet()

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
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
setInterval(retweetLatest, 1000 * 60 * 30)
