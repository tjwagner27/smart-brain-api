const handleSignin = (req, res, db, bcrypt) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json('incorrect form submission');
    }
    db.select('email', 'hash', 'active').from('login')
      .where('email', '=', email)
      .then(data => {
        if (data[0].active === true) {
          const isValid = bcrypt.compareSync(password, data[0].hash);
          if (isValid) {
            return db.select('*').from('users')
              .where('email', '=', email)
              .then(user => {
                res.json(user[0])
              })
              .catch(err => res.status(400).json('unable to get user'))
          } else {
            res.status(400).json('wrong credentials')
          }
        } else {
          return res.status(400).json('unable to get user')
        }
      })
      .catch(err => res.status(400).json('wrong credentials'))
  }

  module.exports = {
    handleSignin
  }