const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
 
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-raunak:Test123@cluster0.0fici.mongodb.net/todolistDB?retryWrites=true&w=majority" , {useNewUrlParser : true , useUnifiedTopology: true});
  
const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({
  name: "Welcome to your Todolist!" 
});

const item2 = new Item({
  name: "Click + to Add!" 
});

const item3 = new Item({
  name: "Select checkbox to Delete!"
});

const defaultItems= [item1, item2 ,item3 ];


app.get("/", function(req, res) {

  Item.find({}, function(err, items) {

    if (err) {
      console.log(err);
    } else {

      if (items.length == 0) {

        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Added successfully!");
          }
        })

        res.redirect("/");

      } else {

        console.log(items);
        res.render("list", {
          listTitle: "Today",
          newListItems: items
        });

      }
    }

  })

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;

  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName == 'Today'){

    item.save();

    res.redirect("/");
  }

  else{

    List.findOne({name : listName} , function(err , foundList){

      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })

  }
});

app.post("/delete", function(req, res) {

  var listName= req.body.ListName;

  var checkedItemId = req.body.checkbox;

  if(listName == "Today"){

    Item.deleteOne({
      _id: req.body.checkbox
    }, function(err) {

      if (err) {
        console.log(err);
      } else {

        console.log("done!");
      }
    });
    res.redirect("/")

  }

  else{

    List.findOneAndUpdate({name : listName} , {$pull : {items : {_id : checkedItemId}}} , function(err , foundList){

      if(!err){

        res.redirect("/" + listName);
      }
    } )
  }
})

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = new mongoose.model("List", listSchema);

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {

    if (err) {
      console.log(err);
    } else {
    //Show a Existing List
      if (foundList) {

        res.render("list", {
          listTitle: customListName,
          newListItems: foundList.items
        });
      } else {
      //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        })

        list.save();
        res.redirect("/" + customListName)

      }
    }
  })

})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
  console.log("Server has started successfully.");
});

