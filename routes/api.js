/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
let mongodb = require('mongodb');
let mongoose = require('mongoose');

module.exports = function (app) {

  //Deprecated:
  //mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true});
  //Produces no warning:
  mongoose.connect(process.env.DB);

  let bookSchema = new mongoose.Schema({
    title: {type: String, required: true},
    comments: [String]
  });

  let Book = mongoose.model('Book', bookSchema);

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let books = await Book.find({});
      let responseArray = [];
      books.forEach((book) => {
        let newObj = {
          title: book.title,
          _id: book._id,
          commentcount: book.comments.length
        };
        responseArray.push(newObj);
      });
      return res.json(responseArray);
    })
    
    .post(async function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
         return res.json("missing required field title");
      } else {
        let newBook = new Book({
          title: title,
          comments: []
        });

        let newDocument = await newBook.save();
        if(newDocument) {
          return res.json({
            title: newDocument.title,
            _id: newDocument._id
          });
        } else {
          return res.json('error adding new book');
        }
      }
    })
    
    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
      let results = await Book.deleteMany({}, {new: true});
      if (results.acknowledged) {
        return res.json('complete delete successful');
      } else {
        return res.json('complete delete unsuccessful');
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      if (!bookid) {
        return res.json('No id given');
      } else {
        let result = [];
        try {
          result = await Book.find({_id: bookid});
        } catch(error) {
          console.log('Book was not found');
        }

        if (result.length === 0) {
          return res.json('no book exists');
        } else {
          return res.json(result[0]);
        }
      }
    })
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if(!comment) {
        return res.json("missing required field comment");
      } else {
        let result = [];
        try {
          result = await Book.find({_id: bookid});
        }catch(error){
          result = [];
        }
        if (result.length === 0) {
          return res.json("no book exists");
        } else {
          let book = result[0];
          book.comments.push(comment);
          let success = await Book.findByIdAndUpdate(bookid, {comments: book.comments}, {new: true});
          return res.json(success);
        }
      }
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      let result = [];
      try {
        result = await Book.find({_id: bookid});
      }catch(error) {
        result = [];
      }

      if (result.length === 0) {
        return res.json('no book exists');
      } else {
        let deleteResult;
        try{
          deleteResult = await Book.findByIdAndDelete(result[0]._id);
        } catch(error) {
          deleteResult = undefined;
        }
        console.log('deleteResult:', deleteResult);
        if (deleteResult) {
          return res.json('delete successful');
        } else {
          return res.json('delete unsuccessful');
        }
      }
    });
  
};
