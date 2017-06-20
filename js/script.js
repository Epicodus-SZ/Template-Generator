//Business Logic
//Array of options available on the web site
var options = [
  {name: "jQuery", webUrl: "https://code.jquery.com/jquery-3.2.1.min.js" , zipFolder: "js/", headContent: "jquery-3.2.1.min.js"},
  {name: "Bootstrap", webUrl: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" , zipFolder: "css/", headContent: "bootstrap.min.css"},
  {name: "README.md", webUrl: "" , zipFolder: "", headContent: ""}];


function HeadItem(headString,placeInHead){
  this.headString = headString;
  this.placeInHead = placeInHead;
}

//Index Object Constructor
function Index() {
  this.first = "<!DOCTYPE html>\n<html>\n"
  this.headItem = [];
  this.last = "  <body>\n  </body>\n</html>"
  this.head = function() {
    tempHead = "  <head>"
    this.headItem.forEach(function(item){
      tempHead+="\n    " + item.headString;
    });
    tempHead+="\n  </head>\n";
    return tempHead;
  }
  this.index = function(){
    return this.first + this.head() + this.last;
  };
}

function writeScriptHead(url){
  //dummie code for now - need to add logic here
  return "<script src='js/" + url + "'></script>"
}

//Generating README
function GenerateReadme() {
    var d = new Date();
    var today = (d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
    var values = {name: $("#inputProject").val(), dev: $("#inputName").val(), day: today}
    readmeText = "# {{name}}\n[Add your description here]. Originally coded on {{day}}. By {{dev}}. \n### License\nCopyright 2017 {{dev}}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.";
    return S(readmeText).template(values).s;
}


//////////////////////////////
//UI Logic
//////////////////////////////

$(document).ready(function() {

  "use strict";

  var Promise = window.Promise;
  if (!Promise) {
    Promise = JSZip.external.Promise;
  }

  /**
   * Reset the message.
   */
  function resetMessage() {
    $("#result")
      .removeClass()
      .text("");
  }
  /**
   * show a successful message.
   * @param {String} text the text to show.
   */
  function showMessage(text) {
    resetMessage();
    $("#result")
      .addClass("alert alert-success")
      .text(text);
  }
  /**
   * show an error message.
   * @param {String} text the text to show.
   */
  function showError(text) {
    resetMessage();
    $("#result")
      .addClass("alert alert-danger")
      .text(text);
  }
  /**
   * Update the progress bar.
   * @param {Integer} percent the current percent
   */
  function updatePercent(percent) {
    $("#progress_bar").removeClass("hide")
      .find(".progress-bar")
      .attr("aria-valuenow", percent)
      .css({
        width: percent + "%"
      });
  }

  /**
   * Fetch the content and return the associated promise.
   * @param {String} url the url of the content to fetch.
   * @return {Promise} the promise containing the data.
   */
  function urlToPromise(url) {
    return new Promise(function(resolve, reject) {
      JSZipUtils.getBinaryContent(url, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  var optionList = $('#optionNameMenu')
  //
  // <div class="checkbox">
  //   <label style="font-size: 1.5em">
  //       <input type="checkbox" value="">
  //       <span class="cr"><i class="cr-icon fa fa-check"></i></span>
  //       Bigger
  //   </label>
  // </div>



  //dynamic checkboxes
  $.each(options, function(item) {

    var formCheck = $('<div>')
      .addClass('checkbox')
      .appendTo(optionList);

    var label = $('<label>')
      .addClass('cbLabel')
      .text(options[item].name)
      .appendTo($(".checkbox").last());

    var inputCheckbox = $('<input>')
      .attr('type', 'checkbox')
      .attr('value', options[item].name)
      .appendTo($(".cbLabel").last());

    var span = $('<span>')
      .addClass('cr')
      .appendTo($(".cbLabel").last());

    var fancyCB = $('<i>')
      .addClass('cr-icon fa fa-check')
      .appendTo($(".cr").last());
  });

  $("#zipButton").click(function(event) {
    event.preventDefault(); // supresses a server event

    //creates our zip file object
    var zip = new JSZip();
    var projectName = $("#inputProject").val();
    var developerName = $("#inputName").val();

    //creates a new index object
    var newIndex = new Index();

    //gets the selected items from our form
    var checkedArray = [];
    $("input[type='checkbox']:checked").each (function() {
      checkedArray.push($(this).val());
    });

    //Adds a README to the zip file
    if ($.inArray("README.md",checkedArray) > -1) {
      zip.file(projectName+"/README.md",GenerateReadme());
    }

    //Adds the index.html file to the zip
    zip.file(projectName+"/index.html",newIndex.index());

    //Add the files to the zip
    checkedArray.forEach(function(item){

      var Opts = $.grep(options, function(option){ return option.name === item; });

      if (Opts[0].webUrl){
        var url = Opts[0].webUrl;
        var filename = projectName+"/"+Opts[0].zipFolder+Opts[0].headContent;
        zip.file(filename, urlToPromise(url), { binary: true });
      }
    });

    // when everything has been downloaded, we can trigger the dl
    zip.generateAsync({ type: "blob" }, function updateCallback(metadata) {
        var msg = "progression : " + metadata.percent.toFixed(2) + " %";
        if (metadata.currentFile) {
          msg += ", current file = " + metadata.currentFile;
        }
        showMessage(msg);
        updatePercent(metadata.percent | 0);
      })
      .then(function callback(blob) {

        // see FileSaver.js
        saveAs(blob, projectName+".zip");

        showMessage("done !");
      }, function(e) {
        showError(e);
      });

  });



  $("#resetButton").click (function() {
    $("#zipForm")[0].reset();
    var checkedArray = [];
  });

});
