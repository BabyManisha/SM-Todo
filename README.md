# SM-Todo
Todo app with Node.js, Express, Vue.js, MongoDB, Socket.io, Docker

# Pre-Requisites 
1)Node
> https://nodejs.org/en

2)MongoDB
> https://docs.mongodb.com/manual/administration/install-enterprise

3)Docker (Need only if want to try the Dockerized todo app)
> https://docs.docker.com/compose/install/#install-compose

4)Nginx (Need only if want to test socket.io with Nginx)
> https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-16-04

# Steps to install it in your local (without docker)
1)Clone the repo
>git clone https://github.com/BabyManisha/SM-Todo.git

2)Change directory to Sm-Todo
>cd SM-Todo

3)Install the dependencies
>npm install

4)Run app
>npm run develop

5)Check the UI in browser at http://localhost:6789/


# Steps to install it in your local (with docker)
1)Clone the repo
>git clone https://github.com/BabyManisha/SM-Todo.git

2)Change directory to Sm-Todo
>cd SM-Todo

3)Checkout to "docker" branch
>git fetch && git checkout docker

4)Build the docker compose
>docker-compose build

5)Run the docker file
>docker-compose up

6)Check the UI in browser at http://localhost:6789/


# Steps to try with Nginx (with out without docker)
1)Follow the above steps based on your requirement (with or without docker)

2)Open your nginx.conf file
>vi /usr/local/etc/nginx/nginx.conf (if MAC)
>vi /etc/nginx/nginx.conf (if Linux)

3)Copy the below content in the nginx.conf file under server section
>
      location / {
            # root   html;
            # index  index.html index.htm;

            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $host;

            proxy_pass http://nodes;

            # enable WebSockets
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
        

4)Copy the below content in the nginx.conf file after server section
> 
    upstream nodes {
        # enable sticky session based on IP
        ip_hash;

        server localhost:6789;
   }
 
  
5)Restart your Nginx
>sudo nginx -s stop && sudo nginx (if MAC)
>sudo service nginx restart (if Linux)

6)Check the UI in browser at http://localhost:8080/
>8080 is default port for nginx, if you wantt to change the port or if your nginx is running in any other port please check the ui in the corresponding port.



# Keep Visiting!!
# Thank you.. :) :)


