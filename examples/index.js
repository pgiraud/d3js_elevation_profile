
var callback = function() {
    console.log(arguments);
};

var sel = d3.select('#chart');
var profile = d3.profile();
queue().defer(d3.json, 'profile.json')
    .await(function(error, data) {
      if (error) {
        console.log(error);
        return;
      }
      data = data.profiles[0].points;
      sel.datum(data).call(profile);
    });
