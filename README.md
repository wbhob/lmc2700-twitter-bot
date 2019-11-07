# Oasis Lyrics Twitter Bot

This bot will generate a tweet with some trained Oasis lyrics.

## Installation

This project depends on `textgenrnn`, `tensorflow`, and python. Make sure that `textgenrnn` and `tensorflow` are installed.

```sh
pip install -q  textgenrnn tensorflow
```

Also, `npm install` the dependencies.

## Training the model

First, put the training data in `model.txt`, separating each bit of data by a newline. Then, run `python3 ./train.py` to run the model trainer. This will output a file called `textgenrnn_weights.hdf5`, which contains the TensorFlow model data. When the script runs, it generates a new string from the training data, and tweets it.

## Running the Bot

Set keys in the config.ts file, OR just run `npm start` which will use a safe-start command to set environment variables. For this project, I've included the keys for safe-start, but in practice, I would remove the keys before pushing to source control.
