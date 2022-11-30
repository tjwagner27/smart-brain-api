exports.handleGetAllProfiles = (req, res, db) => {
  db.select('*').from('users').then(users => {
    if (users.length) {
      res.json(users)
    } else {
      res.status(400).json('not found')
    }
  })
.catch(err => res.status(400).json('error getting user'))
};

exports.handleProfileGet = (req, res, db) => {
  const { id } = req.params;
  db.select('*').from('users').where({id})
    .then(user => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('not found')
      }
    })
    .catch(err => res.status(400).json('error getting user'))
};

exports.handleProfileUpdate = async (req, res, db) => {
  const changes = {};
  if (req.body.name) changes.name = req.body.name;
  if (req.body.email) changes.email = req.body.email

  if (Object.keys(changes).length > 0) {
    const userEmail = (await (await db('users').where({id: req.params.id}))[0]).email;
    if (changes.email) {
      await db('login')
      .update({email: changes.email})
      .where({ email: userEmail})
      .catch((err) => console.log(err))
    }
    await db('users')
      .update(changes)
      .where({ id: req.params.id })
      .catch((err) => console.log(err)) 
  } else {
    res.status(400).json({status: 'error', message: 'Must submit valid changes'})
  }
  const user = await db('users').where({id: req.params.id}).select('*')
  res.status(200).json({
    status: 'success',
    user
  })
};

exports.handleProfileDelete = (req, res, db) => {
  db('users').update({ active: false }).where({id: req.params.id}).catch((err) => console.log(err))
  
  res.status(204).json({
    status: 'success',
    data: null
  })
};

exports.handleProfileChangePassword = (req, res, db, bcrypt) => {
  const { currentPassword, newPassword, email } = req.body;
  db.select('email', 'hash').from('login')
      .where('email', '=', email)
      .then(data => {
        const isValid = bcrypt.compareSync(currentPassword, data[0].hash);
        if (isValid) {
          const newHash = bcrypt.hashSync(newPassword);
          db('login').update({ hash: newHash }).where({email}).catch((err) => console.log(err))
          return res.status(200).json({status: 'success'})
        } else {
          res.status(400).json('wrong credentials')
        }
  
      })
      .catch(err => res.status(400).json('wrong credentials'))
}

exports.handleGetSelf = (req, res, db) => {

  const { id } = req.params;
  db.select('*').from('users').where({id})
    .then(user => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('not found')
      }
    })
    .catch(err => res.status(400).json('error getting user'))
};
 
exports.handleDeleteSelf = (req, res, db) => {
  const { email } = req.body;

  db('login').update({active: false}).where({email: email}).catch((err) => console.log(err))
  
  res.status(204).json({
    status: 'success',
    data: null
  })
};