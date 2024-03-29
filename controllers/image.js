const Clarifai = require('clarifai');

const app = new Clarifai.App({
    apiKey: process.env.API_KEY
});

const handleApiCall = (req, res) => {
    app.models
        .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
        .then(data => {
            res.json(data)
        })
        .catch(err => res.status(400).json('Unable to get information from API'))
}

const handleImage = async (req, res, db) => {
  const { id } = req.body;
  if (id.length === 0) return;
  await db('users').where('id', '=', id)
  .increment('entries', 1)
  .returning('entries')
  .then(entries => {
      res.json(entries[0].entries);
  })
  .catch(err => res.status(400).json('unable to get entries'))
}

module.exports = {
    handleImage,
    handleApiCall
}