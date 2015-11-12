require.config({
    paths: {
        "app": "../app"
    }
});

require(['splunkjs/mvc/simplexml/ready!'], function(){
    require(['splunkjs/ready!'], function(){
    });
});
