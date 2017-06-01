var Actor = require('./models/actor');
var Agent = require('./models/agent');
var Secondrole = require('./models/secondrole');
var Verb = require('./models/verb');
var SourceDictionary = require('./models/sourceDictionary');
var VerbDictionary = require('./models/verbDictionary');
var User = require('./models/user');
var Sentence = require('./models/sentence');
var SentenceTaggingResult = require('./models/sentenceTaggingResult');
var mongoose = require('mongoose');
/*var ObjectId = require('mongoose').Types.ObjectId;*/
var request = require('request');
var http = require('http');

// keep this before all routes that will use pagination


var ObjectId = mongoose.Types.ObjectId;


function getAllVerbs(res) {
  Verb.find({}).sort('id').exec(function(err, verbs) {
    if (err)
      res.send(err);
    res.json(verbs);
  });
}

function getAllTaggingSentences(res){
  SentenceTaggingResult.find(function(err,taggingresult){
    if(err)
       res.send(err);
     res.send(JSON.stringify(taggingresult));
  });
}

function getSourceDictionary(res) {
  SourceDictionary.find(function(err, sourcedictionary) {
    if (err)
      res.send(err);
     res.send(JSON.stringify(sourcedictionary));
  });
}
function getVerbDictionary(res){
  VerbDictionary.find(function(err,verbdictionary){
     if(err)
      res.send(err);
     res.send(JSON.stringify(verbdictionary));
  });
}

function getAllCountryActors(res) {
  Actor.find(function(err, actors) {
    if (err)
      res.send(err);
    res.json(actors);
  });
}

function getAllAgentActors(res) {
  Agent.find(function(err, agents) {
    if (err)
      res.send(err)
    res.json(agents);
  });
}

function customdate(olddate)
{
   var d = new Date(olddate);
  var newdate = (d.getMonth() +1) + '-' + d.getDate() + '-' + d.getFullYear();
}

function getAllSecondroleActors(res) {
  Secondrole.find(function(err, secondrole) {
    if (err)
      res.send(err)
    res.json(secondrole);
  });
}
//only show the non-tagged sentences
function getOneNotTaggedSentence(res) {
  Sentence.count({
    "tagged": false
  }).exec(function(err, count) {
    var random = Math.floor(Math.random() * count);
    Sentence.findOne({
      "tagged": false
    }).skip(random).exec(
      function(err, result) {
        if (result != null)
          res.json(result);
        else
          console.log("no more sentences in the database anymore");
      }
    )

  });
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

function test(res) {
  request.post('http://localhost:5051/get_synonyms', {
      "text": ["laugh"]
    },
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body) // Print the google web page.
      }
    });
}

module.exports = function(app) {

  // api ---------------------------------------------------------------------
  app.get('/api/verbs', function(req, res) {
    getAllVerbs(res);
  })

  //get all country actors
  app.get('/api/actors', function(req, res) {
    getAllCountryActors(res);
  })
  app.get('/api/agents', function(req, res) {
    getAllAgentActors(res);
  })
  app.get('/api/secondroles', function(req, res) {
    getAllSecondroleActors(res);
  })
  app.get('/api/sourcedictionary', function(req, res) {
      getSourceDictionary(res);
    });
   app.get('/api/verbdictionary', function(req, res) {
      getVerbDictionary(res);
    });
  app.get('/api/getallwork', function(req,res){
      getAllTaggingSentences(res);
  });
  app.post('/api/synonyms', function(req, res) {
      //console.log(req.body.word);
      request({
        url: 'http://hanover.cs.ou.edu:9090/ar',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        json: {
          "word": req.body.word
        }
      }, function(error, response, data) {
        if (error) {
          console.log(error);
          res.end({"error":"sorry, the synonym service is not available for now"});
        } else {
          //console.log(response.statusCode, data);
          //sent the result back;
          //res.write(data[0]);
          /*rst=[];
          //decode_utf8
          data.forEach(function(entry) {
          rst.push(decode_utf8(entry));
          });*/
          res.end(JSON.stringify(data));
        }

      });
      //res.end();
    })
    //create new country actor
  app.post('/api/actors', function(req, res) {
    Actor.create({
      name: req.body.text,

    }, function(err) {
      if (err)
        res.send(res);
    });
  });
  //get userid by username
  app.post('/api/getuserid',function(req,res){
      User.find({
      'username': req.body.username
    }, function(err, data) {
      if(data[0]!=null)
      {
       res.json({"userid":data[0].id});
       
      }
      res.end();
    });
  });
/*  SourceDictionary.find({}).sort('-taggingTime').limit(5).exec(function(err, data) {
      res.render('./sourceDictionaryTable.jade', {
        sourcedictionary: data
      });
      res.end();
    });*/
  //post source form
  app.post('/api/addSourceDictionary', function(req, res) {
    /*console.log("start date: "+req.body.dateStart);*/
    if (req.body.dateStart === "") {
      req.body.dateStart = new Date("1800-01-01");
    }
    if (req.body.dateEnd === "") {
      req.body.dateEnd = new Date("1800-01-01");
    }

    //save will represent that we have a different commit value.
   
    var newnoun={
      sentenceId: req.body.sentenceId,
      word: req.body.word,
      countryCode: req.body.countryCode,
      firstRoleCode: req.body.firstRoleCode,
      secondRoleCode: req.body.secondRoleCode,
      confidenceFlag: req.body.confidenceFlag
      }
    var word = req.body.word;
    var r = new RegExp(word,'i');
   
    SourceDictionary.find(
      { 'word': {$regex:r} }
    ).sort('-taggingTime').limit(1).exec(function(err, datalist) {
      data=datalist[0];
      if (data != null) 
      {
        var oldnoun={
          sentenceId:data.sentenceId,
          word:data.word,
          countryCode:data.countryCode,
          firstRoleCode:data.firstRoleCode,
          secondRoleCode:data.secondRoleCode,
          confidenceFlag:data.confidenceFlag
        } 
        if(JSON.stringify(oldnoun)===JSON.stringify(newnoun))
        {
          console.log("current noun with exact tagging component already exist in the database,nothing new will be updated in the database.");
        }  
        else
        {
          newnoun["userName"]=req.body.username;
          newnoun["userId"]=req.body.userid;
          newnoun["dateStart"]=req.body.dateStart;
          newnoun["dateEnd"]=req.body.dateEnd;
          SourceDictionary.create(newnoun);
        }
      } 
      else {
          newnoun["userName"]=req.body.username;
          newnoun["userId"]=req.body.userid;
          newnoun["dateStart"]=req.body.dateStart;
          newnoun["dateEnd"]=req.body.dateEnd;
        SourceDictionary.create(newnoun);
      }
    });
    res.end();
  });
  app.post('/api/addVerbDictionary', function(req, res) {

    VerbDictionary.create({
      sentenceId: req.body.sentenceId,
      word: req.body.word,
      verbcode: req.body.verbcode,
      confidenceFlag: req.body.confidenceFlag,
      /*userName: req.user.username,
      userId: req.user.id*/
      userName:req.body.username,
      userId:req.body.userid
    });
    res.end();
  });

  app.post('/api/deleteSourceDictionary',function(req,res){
    console.log(req.body.sourceid);
    //SourceDictionary.findOneAndRemove({'id':req.body.sourceid});
    SourceDictionary.remove({ _id: req.body.sourceid }, function(err) {
    /*if (err) {
            //message.type = 'notification!';
            console.log("success!")
    }
    else {
            console.log("failed!!");
    }*/
});
   res.end();
  });

  app.post('/addNewSentenceTaggingResult', function(req, res) {

    console.log(req.body.sourceList);
    console.log(req.body.targetList);
    console.log(req.body.verbList);
    SentenceTaggingResult.create({
      sentenceId: req.body.sentenceId,
      sourceList: req.body.sourceList,
      verbList: req.body.verbList,
      targetList: req.body.targetList,
      //userId: req.user.id
      userId:req.body.userid
    }, function(err, data) {
      if (err)
        console.error(err);
      else {
        res.end();
      }
    });

  });

  //finally figure out this is the correct way in mongoose and express to update data.
  app.post('/updateSentenceTag', function(req, res) {

    //make the tag of the sentence to be 1 when commit the whole sentence tagging
    Sentence.findOneAndUpdate({
      "_id": req.body.sentenceId
    }, {
      $set: {
        "tagged": 1
      }
    }, function(err, sentence) {

    });
    res.end();
  });

  //to get the current sentence object, in order to make sure when we click the next sentence, the current sentence already get commited.
  app.post('/getCurrentSentence', function(req, res) {
    var sentenceId = req.body.currentSentenceId;
    Sentence.find({
      '_id': sentenceId
    }, function(err, data) {
      res.json(data);
      res.end();
    });

  });
  //get sentence string by giving sentenceId
  app.post('/getSentenceStringById', function(req, res) {

    var sentenceId = req.body.sentenceId;
    //console.log(sentenceId);
    //console.log(sentenceId);
    Sentence.find({
      '_id':sentenceId/*new ObjectId(sentenceId)*/
    }, function(err, data) {
      /*console.log(data);
      console.log(data[0]);*/
      //console.log(err);
      if(data[0]!=null)
      {
         res.json(data[0].wholeSentence);
         //alert("error happens since mongoose model mapping that yan suggested");
      }
      else
      {
        res.json("mongoose find by id sometimes not working, this is a remind from yan.");
      }
     
      res.end();
    });
  });
  //if the key exist return the object.
  app.post('/nounexist', function(req, res) {
    var word = req.body.word;
    //var r = new RegExp(word,'i');
     //SourceDictionary.find({}).sort('-taggingTime').limit(5).exec
    SourceDictionary.find(
      { 'word': word/*{$regex:r}*/ }).sort('-taggingTime').limit(1).exec(
    function(err, data) {
      if (data[0] != null) {
        res.json(data[0]);
      } else {
        res.json(data[0]);
      }
    })
  });

  app.get('/summaryTable', function(req, res) {
    var queryword = req.param('queryword');
    SourceDictionary.find({
      'word': queryword
    }, function(err, data) {
      
      res.render('./summaryTable.jade', {
        sourcedictionary: data
      });

    });
  });
  //find actor full name
  app.post('/actorfull', function(req, res) {
    //var queryactor=req.param('queryactor');
    var queryactor = req.body.queryactor;
    //console.log(queryactor);
    Actor.find({
      'id': queryactor
    }, function(err, data) {
      res.json(data[0].name);
      //console.log(data[0].name);
    });
  });
  //find agent full name
  app.post('/agentfull', function(req, res) {
    var queryagent = req.body.queryagent;
    //console.log(queryactor);
    Agent.find({
      'id': queryagent
    }, function(err, data) {
      res.json(data[0].name);
    });
  });
  //find second role full name
  app.post('/secondrolefull', function(req, res) {
    var querysecondrole = req.body.querysecondrole;
    //console.log(queryactor);
    Secondrole.find({
      'id': querysecondrole
    }, function(err, data) {
      res.json(data[0].name);
    });
  });


  //this is to get one untagged sentence with some specific words in it
  app.post('/getOneQuerySentence', function(req, res) {
    var r = new RegExp(".*" + req.param('word'), 'i');
    Sentence.count({
      "tagged": false,
      "wholeSentence": {
        $regex: r
      }
    }).exec(function(err, count) {
      var randomnumber=Math.random();
      var random = Math.floor(randomnumber * count);
      //var limitcount=0;
   /*   if(randomnumber<0.5)
      {
        var random=Math.floor((randomnumber+0.25)*count);
      }*/
      //var queryword=req.param('word');

      Sentence.findOne({
        "tagged": false,
        "wholeSentence": {
          $regex: r
        }
      }).limit(1).skip(random).exec(
        function(err, result) {
          if (result != null) {
            res.json(result);
          } else {
            res.json({
              'output': 'notfound'
            });
            console.log("find 0 sentence with this query");
          }
        }
      )

    });

  });
  //this is to get the total sourceDictionary tagging for this student
  app.get('/getSourceTaggingCountForCurrentUser', function(req, res) {

    SourceDictionary.find({
      'userId': req.user.id
    }, function(err, data) {
      res.json(data.length);
      //console.log(data.length);
      res.end();
    });
    //by the way if you put res.end() here it will end the res immedaitely and callbacs res.json might try to change res, so it will give u an error 
  });
  //get the total verb tagging for current student
  app.get('/getVerbTaggingCountForCurrentUser', function(req, res) {
    VerbDictionary.find({
      'userId': req.user.id
    }, function(err, data) {
      res.json(data.length);
      res.end();
    });
  });
  //get the total sentence tagging for current student
  app.get('/getSentenceTaggingCountForCurrentUser', function(req, res) {
    SentenceTaggingResult.find({
      'userId': req.user.id
    }, function(err, data) {
      res.json(data.length);
      res.end();
    });
  });
  //find flagged source count
  app.get('/getFlaggedSourceTaggingCountForCurrentUser', function(req, res) {
    //flagged=1 means the user is not sure
    SourceDictionary.find({
      'userId': req.user.id,
      'confidenceFlag': true
    }, function(err, data) {
      res.json(data.length);

      res.end();
    });
  });

  //find flagged verb count
  app.get('/getFlaggedVerbTaggingCountForCurrentUser', function(req, res) {
    //flagged=1 means the user is not sure
    VerbDictionary.find({
      'userId': req.user.id,
      'confidenceFlag': true
    }, function(err, data) {
      res.json(data.length);
      res.end();
    });
  });

  //get the most recent 5 sourceDictionary record
  app.get('/getLatestSourceDictionItems', function(req, res) {

    SourceDictionary.find({}).sort('-taggingTime').limit(5).exec(function(err, data) {
      res.render('./sourceDictionaryTable.jade', {
        sourcedictionary: data
      });
      res.end();
    });
  });

  //get the most recent 5 verbdictionary records
  app.get('/getLatestVerbDictionItems', function(req, res) {

    VerbDictionary.find({}).sort('-taggingTime').limit(5).exec(function(err, data) {
      res.render('./verbDictionaryTable.jade', {
        verbdictionary: data
      });
      res.end();
    });
  })

  app.get('/getAllFlaggedNouns', function(req, res, next) {
    var codername=req.query.username;
    //console.log("codername: "+codername);
    if(codername===null||typeof codername==='undefined'||codername==="")
    {
         var querypage=req.query.page;
        
         if(querypage===null||typeof querypage==='undefined'||querypage==="")
         {
          querypage=1;
         }
         else
         {
          querypage=req.query.page;
         }
         //confidenceFlag': true
          SourceDictionary.paginate({'confidenceFlag':true}
          //this needs to be set back later
          //'confidenceFlag': true
        , {
          page: querypage,
          limit: req.query.limit,
          sort: {
            taggingTime: 'desc'
        }
        }).then(function(result) {
          //ToDO: this is some function that can be extracted, since it is used in both getAllFlaggedNouns and in getAllFlaggedVerbs
          var totalPages = 0;
          if (result.total % req.query.limit === 0) {
            totalPages = Math.trunc(result.total / req.query.limit);
          } else {
            totalPages = Math.trunc(result.total / req.query.limit) + 1;
          }

          res.render('./sourceDictionaryTableWithEdit.jade', {
            allFlaggedNouns: result.docs,
            totalPages: totalPages
          });

          res.end();
        });
    } 
    else
    {
        var querypage=req.query.page;
        var regex = new RegExp(["^", codername, "$"].join(""), "i");
         if(querypage===null||typeof querypage==='undefined'||querypage==="")
         {
          querypage=1;
         }
         else
         {
          querypage=req.query.page;
         }
        SourceDictionary.paginate({"userName":regex,'confidenceFlag': true}
        //this needs to be set back later
        //'confidenceFlag': true
      , {
        page: querypage,
        limit: req.query.limit,
        sort: {
          taggingTime: 'desc'
      }
      }).then(function(result) {
        //ToDO: this is some function that can be extracted, since it is used in both getAllFlaggedNouns and in getAllFlaggedVerbs
        var totalPages = 0;
        if (result.total % req.query.limit === 0) {
          totalPages = Math.trunc(result.total / req.query.limit);
        } else {
          totalPages = Math.trunc(result.total / req.query.limit) + 1;
        }

        res.render('./sourceDictionaryTableWithEdit.jade', {
          allFlaggedNouns: result.docs,
          totalPages: totalPages
        });

        res.end();
    });
    }   
  });

  app.get('/getAllFlaggedVerbs', function(req, res, next) {
       
      var codername=req.query.username;
      if(codername===null||typeof codername==='undefined'||codername==="")
      {
        var querypage=req.query.page;
        
         if(querypage===null||typeof querypage==='undefined'||querypage==="")
         {
          querypage=1;
         }
         else
         {
          querypage=req.query.page;
         }
          VerbDictionary.paginate({'confidenceFlag': true}, {
            page: querypage,
            limit: req.query.limit,
                sort: {
              taggingTime: 'desc'
          }
          }).then(function(result) {
            var totalPages = 0;
            if (result.total % req.query.limit === 0) {
              totalPages = Math.trunc(result.total / req.query.limit);
            } else {
              totalPages = Math.trunc(result.total / req.query.limit) + 1;
            }

            res.render('./verbDictionaryTableWithEdit.jade', {
              allFlaggedVerbs: result.docs,
              totalPages: totalPages
            });
            res.end();
          });
      }
      else
      { 
         var regex = new RegExp(["^", codername, "$"].join(""), "i");
        var querypage=req.query.page;
        
         if(querypage===null||typeof querypage==='undefined'||querypage==="")
         {
          querypage=1;
         }
         else
         {
          querypage=req.query.page;
         }
          VerbDictionary.paginate({
            "userName":regex,
            'confidenceFlag': true
          }, {
            page: querypage,
            limit: req.query.limit,
                sort: {
              taggingTime: 'desc'
          }
          }).then(function(result) {
            var totalPages = 0;
            if (result.total % req.query.limit === 0) {
              totalPages = Math.trunc(result.total / req.query.limit);
            } else {
              totalPages = Math.trunc(result.total / req.query.limit) + 1;
            }

            res.render('./verbDictionaryTableWithEdit.jade', {
              allFlaggedVerbs: result.docs,
              totalPages: totalPages
            });
            res.end();
          });

      }


  });



  //get count of all the sourcedictionary 
  app.get('/getTotalAndFlaggedSourceCountArray', function(req, res) {
    SourceDictionary.find({}, function(err, data) {
      var countlist = [];
      countlist.push(data.length);
      SourceDictionary.find({
        'confidenceFlag': true
      }, function(err1, data1) {
        countlist.push(data1.length);
        res.json(countlist);
        res.end();
      });
    });
  });
  //get count of all the verb dictionary 
  app.get('/getTotalAndFlaggedVerbCountArray', function(req, res) {
    VerbDictionary.find({}, function(err, data) {
      var countlist = [];
      countlist.push(data.length);

      VerbDictionary.find({
        'confidenceFlag': true
      }, function(err1, data1) {

        countlist.push(data1.length);
        res.json(countlist);
        res.end();
      });
    });
  });


  //update the verb code in verb dictionary
  app.post('/updateVerbDictionary', function(req, res) {
    VerbDictionary.findOneAndUpdate({
      "_id": req.body.dicId
    }, {
      $set: {
         "word":req.body.verbword,
        "verbcode": req.body.verbcode,
        "confidenceFlag":req.body.verbconfidence

      }
    }, function(err, dic) {

      console.log(err);
    });
    res.end();
  });

  //update source didctionary based on sourceDictionaryId
  app.post('/updateSourceDictionary', function(req, res) {
    SourceDictionary.findOneAndUpdate({
      "_id": req.body.dicId
    }, {
      $set: {
        "word":req.body.sourceWord,
        "countryCode": req.body.countryCode,
        "firstRoleCode": req.body.firstRoleCode,
        "secondRoleCode": req.body.secondRoleCode,
        "dateStart": req.body.dateStart,
        "dateEnd": req.body.dateEnd,
        "confidenceFlag":req.body.sourceconfidence,
        "editByName":req.body.editByName,
        "editById":req.body.editById,
        "editTime":Date.now()
      }
    }, function(err, sourcedic) {
      console.log(err);
    });
    res.end();
  });


  //get count of the whole sentence count
  app.get('/getSentenceTotalCount', function(req, res) {
    SentenceTaggingResult.find({}, function(err, data) {
      res.json(data.length);
      res.end();
    });

  });

  //this is for loop through the sentence
  app.get('/sentences', function(req, res) {

    getOneNotTaggedSentence(res);
  });


  // application -------------------------------------------------------------
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
  });



};