 //this javascript is for the add tab button for multiple rows. 
 //originally want to only put the tab handle code here,
 //now put all the after page load js code here
$(function() {
    var tabs= $( "#tabs" ).tabs();

     var tabTemplate = "<li><a href='#{href}' id='#{tabid}'>#{label}</a></li>";
     var tabCounter=2;

//for click the summary tab.
      $("#tabid2").click(function(){
      console.log("hello tehre!");
      $.ajax({
        url:"/summaryTable",
        success:function(result){
          $("#summary").html(result);
        }
      });
    });

    function addTab(){
    	var label="role"+tabCounter;
    	var id="tabs-"+tabCounter;
    	var   li = $( tabTemplate.replace( /#\{href\}/g, "#" + id ).replace( /#\{label\}/g, label ).replace(/#\{tabid\}/g,"tabid"+tabCounter) );
    	tabs.find( ".ui-tabs-nav" ).append( li );
      //tabs.append( "<div id='" + id + "'>" +  "<div ng-include='"+"../../partials/testPartial.html"+"'></div>" + "</div>" );
      tabs.append("<div id='summary'></div>");
      tabs.append();
    	tabs.tabs( "refresh" );
      
      //this function has to be defined here, if not dynamically, when page load $('#') this objetc may not exist yet.
      $("#tabid2").click(function(){
      console.log("hello tehre!");
      $.ajax({
        url:"/summaryTable",
        success:function(result){
          $("#summary").html(result);
        }
      });
    });

      tabCounter++;
    }


    $("#addSource").click(function(){
      addTab();
    });


    
//*************************************when underlying box change make the hidden input change*********************//

$("#combobox0").change(function() {
    $(this).closest('div.ui-widget').find('input.comboboxinput').val($(this).val());
    });
$("#combobox1").change(function() {
    $(this).closest('div.ui-widget').find('input.comboboxinput').val($(this).val());
    });
$("#combobox2").change(function() {
    $(this).closest('div.ui-widget').find('input.comboboxinput').val($(this).val());
    });

//***************end********************************************************************************************//
  

    //this is for click the show all button when page load
    $('#toggle0').click();
    $('#toggle1').click();
    $('#toggle2').click();
    
  });
