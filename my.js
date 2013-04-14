function app() {

var dealAPI = 'http://secret-coast-5576.herokuapp.com/deals';
var confirmAPI = 'http://secret-coast-5576.herokuapp.com/confirm';
var cache;
var useCaching = false;
// Make httpPost request to url and then return callback.
function httpPost (url, jdata, callback)
{
  $.post(url, jdata, callback);
}

// Some filthy hack to pass parameters between pages.
$.urlParam = function(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    return results[1] || 0;
}

// Make httpGet request to url and then return callback.
function httpGet( url, callback)
{   
    if (useCaching)
    {
        console.log("CACHE");
        console.log(cache);
        if (cache != undefined)
        {
            console.log('Using cached value');
            return callback(cache);
        }
        $.getJSON(url, function(data)
        {
            console.log('Caching value.');
            if (cache == undefined) {
                cache = data;
            }
            return callback(data);
        });
    } else {
        $.getJSON(url, callback);
    }
}

function build_out_element(item, name, image, _id)
{
    var u = 'url("'+image+'")';    
    var el = $("<a>", 
    {"href":"meal_choice.html?choice=" + _id, "data-transition":"slide", "class":"box restaurant", "id":"Rest"+item})
    .css('background-image', u)
    .html('<p id="Rest' + item
        + 'Name">'+name+'<div class="yelp star5"></div></p>');
    return el;
}

function build_meal_choice_element(item, image, name, price, description)
{

    function adder() {
        
    }
    var el = $("<div>", 
    {"data-transition":'slide', "class" :'box meal', "id" :'Meal'+item })
    .css('background-image', 'url("'+image+'")')
    .html('<div data-role="fieldcontain" class="top-layer">'
           +'<a href="#" class="add-circle" '
            + 'onclick="javascript:$(\'#quantity_'+item+'\').val(parseInt($(\'#quantity_'+item+'\').val())+1);">'
             + '<div class="plus">afds</div></a>'
           +'<input type="" class="quantity" min="0" max="10" name="quantity_'+item+'" id="quantity_'+item+'" value="0" />'
           +'<a href="#" class="add-circle"'
            + 'onclick="javascript:$(\'#quantity_'+item+'\').val(parseInt($(\'#quantity_'+item+'\').val())-1);"> <div class="minus"></div></a>'
           + '</div>'
           + '<div class=desc> <span id="dish_name"> ' + name 
           +'</span> <span id="dish_price">$' + price/100
           +'</span> <br/> <small id="dish_desc">' + description
           +'</small></div> '); 
    return el;
}


// function quantities()
// {
//     console.log('In quantities.');
//     $('input[name^="quantity"]').each( function(el) {
//         console.log(el.value);
//     });

// }

// Fetch and show all the options for eating out at a particular restaurant. 
$('#out').live('pageshow', function () {     
    // Fetch all of todays deals
    httpGet(dealAPI, function(f) { 
        // Clear out the div
        // console.log('Received length: ' + f.length);
        // console.log('Clearing the div.');
        $('#out_choices').html('');   
        //Loop through the deal
        $.each(f, function (i, data) {
            // console.log('Received: ' + data.name);
            // Only restaurants
            if (data['dinner_type'] === 'Eat out') {
                // console.log('Adding: ' + data.name);
                
                el = build_out_element(i, data.name, data.image, data["_id"]["$oid"]);
                // console.log('Adding');
                $('#out_choices').append(el);
            }
            else
            {
                console.log('NOT adding non-restaurant: ' + data.name);
            }
        });  
    });
});

$('#meal_choice').live('pageshow', function () {

    var choice = $.urlParam('choice');

    httpGet(dealAPI, function(dinners) { 

    $('#meal_choice_choices').html('');
  
    for(var k = 0; k < dinners.length; k++)
{

        if (dinners[k]["_id"]["$oid"] != choice) continue;
    $.each(dinners[k].components, function (i, data) {
        el = build_meal_choice_element(i, data.image, data.name, data.price, data.description);
        $('#meal_choice_choices').append(el);
    });  
        }
    });

    $('#order').click(function() {
        var postData = {}
        console.log('In quantities.');
         $('input[name^="quantity"]').each( function() {
            postData[this.name] = this.value;
            console.log(this.name);
         });
        
        postData["dinner_id"] = choice;
        httpPost(dealAPI, postData, function(data)
        {
            console.log("Back from confirmations.");
            data = $.parseJSON( data );
            console.log(data['order_id']);
            $.mobile.changePage( "confirm.html?order_id=" + data['order_id'], { transition: "slide" });

        });
    });


});




$('#confirm').live('pageshow', function () {     

    var order_id = $.urlParam('order_id');
    
    httpGet(confirmAPI + "/" + order_id, function( f ) { 
       
        // Set page items from json object.

        $('#confirm_button').bind('click', function() {
            console.log("Clicked confirm");
            
            httpPost (confirmAPI, {"order_id" : order_id}, function() {
                $.mobile.changePage( "success.html", { transition: "slide" });

            } );

        });
    });

});




}

try {
    $(function() { 
        app();
    });
} catch (error) {
    console.error("Your javascript has an error: " + error);
}
