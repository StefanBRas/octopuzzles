module.exports = {
  async up(
    /** @type {import('mongodb').Db} */
    db
  ) {
    // Create unique index on user email
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    // Create unique index on user username
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    // Create index on sudoku, so a user can not make several sudokus with the same title
    await db.collection('sudokus').createIndex({ user_id: 1, title: 1 }, { unique: true });
    // Create index on votes, so a user can not make several votes on the same sudoku
    await db.collection('votes').createIndex({ user_id: 1, sudoku_id: 1 }, { unique: true });
    // Create index on walkthroughs, so a user can not make several walkthroughs on the same sudoku
    await db.collection('walkthroughs').createIndex({ user_id: 1, sudoku_id: 1 }, { unique: true });
  },

  async down() {
    // Don't do anything here
  }
};
