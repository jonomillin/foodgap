



var dealAPI = 'http://secret-coast-5576.herokuapp.com/deals';
var confirmAPI = 'http://secret-coast-5576.herokuapp.com/confirm';
var signinAPI = 'http://secret-coast-5576.herokuapp.com/api/signin';

// var dealAPI = 'http://127.0.0.1:10080/deals';
// var confirmAPI = 'http://127.0.0.1:10080/confirm';
// var signinAPI = 'http://127.0.0.1:10080/api/signin';
var cache;
var useCaching = false;
// Make httpPost request to url and then return callback.
function checkPreAuth() {
    console.log('Int pre auth');
    var form = $("#loginForm");
    if(window.localStorage["email"] != undefined && window.localStorage["password"] != undefined) {
        $("#email", form).val(window.localStorage["email"]);
        $("#password", form).val(window.localStorage["password"]);
        handleLogin();
    }
    else
    {
        console.log('Nothing stored');
    }
}

function handleLogin() {
    var form = $("#loginForm");    
    //disable the button so we can't resubmit while we wait
    $("#submitButton",form).attr("disabled","disabled");
    var u = $("#email", form).val();
    var p = $("#password", form).val();
    console.log("click");
    console.log(u);
    console.log(p);
    if(u != '' && p!= '') {
        $.post(signinAPI, {email:u,password:p}, function(res) {
            console.log(res);
            if(res.status == "ok") {
               window.localStorage["email"] = u;
               window.localStorage["password"] = p;             
               console.log('success');
                $.mobile.changePage("main.html");
                console.log('changed');
            } else {
                navigator.notification.alert(
'Incorrect email and/or password.',  // message
function() {},         // callback
'Info',            // title
'OK'                  // buttonName
);
   
            }
         $("#submitButton").removeAttr("disabled");
        },"json");
    } else {
        //Thanks Igor!
        navigator.notification.alert(
'You must enter an email and password.',  // message
function() {},         // callback
'Info',            // title
'OK'                  // buttonName
);
   
        $("#submitButton").removeAttr("disabled");
    }
    return false;
}


function httpPost (url, jdata, callback)
{

  $.post(url, jdata, callback).error( function() { 
    navigator.notification.alert(
'You require an active data connection.',  // message
function() {},         // callback
'Info',            // title
'OK'                  // buttonName
);
   
  });
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
        }).error( function() { 
                navigator.notification.alert(
'You require an active data connection.',  // message
function() {},         // callback
'Info',            // title
'OK'                  // buttonName
);
   

        });
    } else {
        $.getJSON(url, callback).error( function() { 
    navigator.notification.alert(
'You require an active data connection.',  // message
function() {},         // callback
'Info',            // title
'OK'                  // buttonName
);
   
        });
    }
}

function build_out_element(item, name, image, _id)
{
    var u = 'url("'+image+'")';    
    var el = $("<a>", 
    {"href":"meal_choice.html?choice=" + _id, "data-transition":"slide", "class":"box restaurant rest"})
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
    {"data-transition":'slide', "class" :'box meal' })
    .css('background-image', 'url("'+image+'")')
    .html('<div data-role="fieldcontain" class="top-layer">'
           +'<a href="#" class="add-circle" '
            + 'onclick="javascript:$(\'#quantity_'+item+'\').val(parseInt($(\'#quantity_'+item+'\').val())+1);">'
            + '<div class="plus"></div></a>'
           +'<input type="" readonly class="quantity" min="0" max="10" name="quantity_'+item+'" id="quantity_'+item+'" value="0" />'
           +'<a href="#" class="add-circle"'
            + 'onclick="javascript:$(\'#quantity_'+item+'\').val(parseInt(Math.max(0, $(\'#quantity_'+item+'\').val()-1)));">'
            + '<div class="minus"></div></a>'
           + '</div>'
           + '<div class=desc> <span id="dish_name"> ' + name 
           +'</span> <span id="dish_price">$' + parseFloat(price/100).toFixed(2)
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
function init()
{
    console.log('Attaching even handlers');

console.log('Attaching manual login submit.');
$("#loginForm").on("submit",handleLogin);



// Fetch and show all the options for eating out at a particular restaurant. 
console.log('Attaching #out pageshow.');
$('#out').live('pageshow', function () {     
    $.mobile.showPageLoadingMsg();
    var dinner_type = $.urlParam('dinner_type');
    //alert(dinner_type);
    console.log(dinner_type);
    // Fetch all of todays deals
    httpGet(dealAPI, function(f) { 
        // Clear out the div
        // console.log('Received length: ' + f.length);
        // console.log('Clearing the div.');
        //$('#out_choices').html('');   
        //Loop through the deal
        $.mobile.hidePageLoadingMsg();
        $.each(f, function (i, data) {
            //console.log('Received: ')
            //console.log(data);
            // Only restaurants
            if (data['dinner_type'] == dinner_type) {
                // console.log('Adding: ' + data.name);
                console.log('Showing: ' + data.name);   
                el = build_out_element(i, data.name, data.image, data["_id"]["$oid"]);
                // console.log('Adding');
                $('#out_choices').append(el);
            }
            else
            {
                console.log('Not showing: ' + data.name);
            }
        });  
    
    });
});

console.log('Attaching #mealchoice pageshow.');
$('#meal_choice').live('pageshow', function () {
    $.mobile.showPageLoadingMsg();
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
    $.mobile.hidePageLoadingMsg();
    });

    $('#order').click(function() {
        $.mobile.showPageLoadingMsg();
        var postData = {}
        var totalItems = 0;
         $('input[name^="quantity"]').each( function() {
            postData[this.name] = this.value;
            totalItems += this.value;
            console.log(this.name);
         });

         if (totalItems == 0)
         {
            $.mobile.hidePageLoadingMsg();
   
            navigator.notification.alert(
'You must select at least one item.',  // message
function() {},         // callback
'Info',            // title
'OK'                  // buttonName
);
   
            $('#order').removeClass('ui-btn-active')
            return 0;
         }
        
        postData["dinner_id"] = choice;
        postData["email"] = window.localStorage["email"];

        httpPost(dealAPI, postData, function(data)
        {
            console.log("Back from confirmations.");
            data = $.parseJSON( data );
            console.log(data['order_id']);
            $.mobile.hidePageLoadingMsg();
            $.mobile.changePage( "confirm.html?order_id=" + data['order_id'], { transition: "slide" });

        });
    });

});



console.log('Attaching #confirm pageshow.');
$('#confirm').live('pageshow', function () {     
    $.mobile.showPageLoadingMsg();
    var order_id = $.urlParam('order_id');
    
    httpGet(confirmAPI + "/" + order_id, function( f ) { 
       
       console.log('Final order');
       console.log(f);

               
        var k = 0;
        for(var item in f['dinner']['components'])
        {
            var obj = f['dinner']['components'][item];
            console.log(obj['name'] + ' - ' + obj['quantity'] + 'x' + obj['price']);
            $('#item' + k).html(obj['quantity'] + ' x ' + obj['name']);
            $('#price' + k).html('$' + parseFloat( parseInt(obj['quantity']) * parseInt(obj['price']) / 100.0).toFixed(2));
            k = k + 1;
        }

       $('#total_price').html('$' + parseFloat(f['price'] / 100).toFixed(2));
       $('#address').html(f['dinner']['name']);
       $('#contact_info').html(window.localStorage["email"]);
        // Set page items from json object.

        $('#confirm_button').bind('click', function() {
            $.mobile.showPageLoadingMsg();
            $('#order').removeClass('ui-btn-active')
            console.log("Clicked confirm");
            
            httpPost (confirmAPI, {"order_id" : order_id, 'time' : $('#booking_time').val()}, function() {
                $.mobile.hidePageLoadingMsg();
                $.mobile.changePage( "success.html", { transition: "slide" });

            } );

        });
    $.mobile.hidePageLoadingMsg();
    });

});


}