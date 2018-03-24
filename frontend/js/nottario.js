var app = new Vue({
  el: '#app',
  data: {
    etherscanLink:"",
    hash:"",
    name:"",
    lastModified:"",
    size:"",
    type:"",
    error: "",
    tx: "",
    profile: null,
    nottarioHistory: null,
    contractAddress: null,
    web3Missing: false,
    animate: false,
    upload_visible: false,
    blockstack_enabled: false,
    dragging: false
  },
  methods: {
    about: function (){
      window.location.href = "about.html";
    },
    contact: function (){
      window.location.href = "contact.html";
    },
    display_upload: function() {
      window.scrollTo(0,0);
      app.upload_visible = true;
    },
    cancel_upload: function() {
      app.upload_visible = false;
      app.hash = "";
      app.name = "";
      app.lastModified = "";
      app.size = "";
      app.type = "";
      app.error =  "";
      app.tx="";
      app.animate = false
   }
  }
})

function allowDrop(ev) {
  ev.preventDefault();
  app.dragging = true;
}

function dragout(ev) {
  console.log('drag out');
  app.dragging=false;
}

function drop_handler(ev) {
  console.log("Drop");
  ev.preventDefault();
  app.dragging=false;
  console.log('ev is', ev);
  var f = ev.dataTransfer.files[0];
  if (!f) {
    return alert('Cannot read file meta data');
  }
  console.log ("the file is" , f);
  app.lastModified = f.lastModified;
  app.name = f.name.substr(0,32);
  app.size = f.size;
  app.type = f.type.substr(0,32);
  var reader = new FileReader();
  reader.onload = function(event) {
    console.log('onload!',event);
    console.log(typeof event.target.result);
    sha256(event.target.result).then(function(d){
      console.log("digest is", d);
      app.hash = d;
      console.log("hash is " + app.hash);
      var url = 'pay.html?name='+encodeURIComponent(app.name);
      url += '&lastModified='+encodeURIComponent(app.lastModified);
      url += '&size='+encodeURIComponent(app.size);
      url += '&type='+encodeURIComponent(app.type);
      url += '&hash='+encodeURIComponent(app.hash);
      window.location = url
    });
    
    

  };
  reader.readAsText(f);
}




