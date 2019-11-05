from textgenrnn import textgenrnn

textgen = textgenrnn()
textgen.train_from_file('model.txt', num_epochs=10)