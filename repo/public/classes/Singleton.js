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

        setUser: function(name, email, password, accessLevel){

            _user = new User(name, email, password, accessLevel);
            console.log("Singleton - New current user: " + name + ", " + email + ", " + password + ", " + accessLevel);
        },

        clearUser: function(){
            _user = new User("undefined", "undefined", "undefined", 4);
            console.log("Singleton - User cleared");
        }
    };
})();

module.exports = Singleton;