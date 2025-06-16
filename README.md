## Setup
intall required node versin with
```bash
$ nvm install && nvm use
```
then install project dependencies
```bash
$ npm install
```


## Running

In the project directory run:

```bash
npm run dev # or npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>


## Deploying on local machine

#### First time
1. Build the app for production into `./dist/` folder.
   ```bash
   npm run build
   ```

2. Create  `/var/www/rpg/html/` folder and copy `./dist/` into the expected folder by nginx. _(defined at `./nginx.conf`)_
   ```bash
   sudo rm -r /var/www/rpg/html
   sudo mkdir -p /var/www/rpg/html/
   sudo cp -r ./dist/* /var/www/rpg/html/
   ```

3. Create nginx conf file by copying `./nginx.conf` into `/etc/nginx/conf.d/`.
   ```bash
   sudo cp ./nginx.conf /etc/nginx/conf.d/rpg.conf
   ```

5. Lastly, start or reload nginx
   ```bash
   sudo nginx
   ```
   or
   ```bash
   sudo nginx -s reload
   ```

#### Update deploy
If you already set up all nginx configs because you've deployed once,<br/>
just rebuild and copy the build into `/var/www/rpg/html/` :

```bash
npm run build
sudo cp -r ./dist/* /var/www/rpg/html/
```