const User = require("./User.js");

var Singleton = (function() {

    var _user;

    return { // public interface
        
        getUser: function(){
            if(!_user){
                return null;
            }
            else{
                return _user;
            }
        },

        createUser: function(name, email, password, accessLevel){

            _user = new User(name, email, password, accessLevel);
            console.log("New user is set up");
        },

        clearUser: function(){
            delete _user;
        }
    };
})();

module.exports = Singleton;