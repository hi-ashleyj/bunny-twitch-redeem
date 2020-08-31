# Hey!  
  
You'll need node.js installed on your system and in your path to run this.  
  
Setup:  
  
Run the install script, or `npm install` from your clone directory  
  
To set up the locations and folders and stuff, run it once with the `run.bat` or run `node app.js`  
  
Here's how you use it:  
  
Once you've run it once, it should create all its directories.  
  
Then, it'll open a web browser and ask for twitch permissions. This will happen in your default browser. If that's not where you're signed in, close the tab and head to the browser where you are, and go to [http://localhost:6969/auth](http://localhost:6969/auth). That should do the same thing.  
  
Once you've given it twitch permissions, you can start adding the redeemables. It will have created a folder at C:\\Users\\{user}\\twitch-redemption  
  
You can add any video files in here. All you have to do is make sure that the file name (before the .mp4, .mov etc) is the same as the 'title' of the redeemable on twitch.  
  
Then add a browser source in obs/streamlabs/whatever, set the url to `http://localhost:6969`  
  
It'll take the most recent config whenever you load it. You can also reload it by opening a new tab and heading to [http://localhost:6969/?reload=user](http://localhost:6969/?reload=user), or use curl on the command line.

Once you've added some files, you can test that it works by running [http://localhost:6969/?test={name}](http://localhost:6969/?test={name}). The notification should pop up on the thing with sound and everything. Yay.

