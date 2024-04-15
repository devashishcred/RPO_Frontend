# Angular 10 Project Setup and Build Guide

## Project Setup Flow

Before proceeding, ensure you have a backup of your project and if you did any changes please revert them by using "git
stash"

1. Replace "node_modules" Folder:
    - Begin by replacing the existing "node_modules" folder in your project directory.
    - Please find attached node_modules to replace it with old node_modules folder.

2. Run the Project:
    - Execute the command ```ng s ``` to start the project.

3. Update Angular and Node.js Versions if Necessary:
    - If the project fails to run, ensure you have the following versions:
        - Angular CLI: 13.3.11
        - Node: 16.10.0
        - Package Manager: npm 7.24.0

4. Reattempt Project Run:
    - Close the project and reopen it before retrying ```ng s``` .

## Project Build Flow

1. Check API_URL:
    - Inspect the "app.constants.ts" file to verify the API URL.

2. Update API_URL:
    - Within "app.constants.ts," update the API_URL based on the environment:
        - QA API_URL: https://rpo.credencys.net:8091/
        - Prod API_URL: https://rpo.snapcor.com:8091/

3. Update Version Number
    - Open "package.json" and increment the version number under "version":
        - E.g., Change from "1.6.0" to "1.6.1".

4. Save Changes:
    - Save the modified "app.constants.ts" and "package.json" files.

5. Run Build Command

- Execute npm run new-build, a custom command specified in "package.json".

# Angular 11 Upgrade Guide

- nvm v16.14.0
- npm install -g @angular/cli@13
- npm install @angular/core@10
- ng update @angular/compiler@10
- ng update @angular/core@11 @angular/cli@11 @angular/compiler@11 --allow-dirty
- ng update @angular/material@10
- ng update @angular/material@11
- npm i @angular-devkit/build-angular@0.1102.19 --force
- npm install @angular/cli@11 --save-dev
- npm uninstall angular-sortablejs --force
- npm uninstall sortablejs --force
- npm i -S ngx-sortablejs sortablejs
- npm i -D @types/sortablejs
- npm uninstall node-sass
- npm i @ng-select/ng-select@6

# Angular 12 Upgrade Guide

- npm uninstall @angular/http
- npm uninstall angular2-moment
- npm install --save moment ngx-moment
- ng update @angular/core@12 @angular/cli@12 ngx-toastr@12 --allow-dirty
- npm install @angular-devkit/build-angular@12.2.17 @angular/cli@12.2.17
- npm uninstall angular-webstorage-service --force
- import { SESSION_STORAGE, WebStorageService } from 'angular-webstorage-service';
- npm install angular-file --save-dev ...ngfDrop
    - updateDocument.component.ts
- npm i angular2-multiselect-dropdown
- fix files
    - masterform.component.html
- ng update @angular/material@12
- npm install @angular/material@12
- npm install @ng-select/ng-select@7
- npm install zone.js@0.11.4
- npm install ngx-bootstrap@7.1.0

- npm uninstall node-sass
  npm i npm i bootstrap@3.4.1 bootstrap-sass@3.4.1

## changes

- checklist.component.ts
- tsconfig.json removed  "enableIvy":false
-

## TODO

- circular dependency issue
    - modified dataTables.extensions.ts
    - Removed AppModule reference
- //import 'bootstrap-loader'; in app.component.ts
- removed @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"); from styles.scss
- what is up with SignalR
- why do we need bootstrap-loader
- how are we using bootstrap? we need to upgrade to at least 4.0
    - "bootstrap-sass": "^3.3.7"
    - "bootstrap": "^3.3.7",
    - "bootstrap-loader": "^2.2.0"
- why we have 2 WSYWIG editors
    - ckeditor
    - tinymce

# Useful Commands

- export NODE_OPTIONS=--openssl-legacy-provider
- ng build &> ../log.txt
- rm -rf ~/node_modules
- npm install -g @angular/cli@13
- npm cache clean --force
----------------
# Review with the team

## TS Lint to ESLint

- node 16
- npm install --force
- codelyzer@3.2.2 needs 2.3.1 needs @angular/compiler 4.0.0-beta <5.0.0
- @angular/compiler-cli@12.2.17 needs @angular/compiler@^12.2.17
- switch to ESlint
- https://www.telerik.com/blogs/angular-basics-using-eslint-boost-code-quality

# Issue I had to fix

- masterform.component.html

# Questions

- SignalR is not working in PROD. Is this being used?
- Why we have 2 WSYWIG editors
    - ckeditor
    - tinymce - not used?

- angular-file

# Bootstrap is being added in assets because we use default bootstrapjs + ngx-bootstrap

- "node_modules/bootstrap/dist/js/bootstrap.min.js"

# Remove webpack compilation

- bootstrap-loader
- bootstrap-sass
- "url-loader": "^0.6.1",
- "webpack": "^4.4.1",
- "webpack-bundle-analyzer": "^2.9.0",
- "webpack-cli": "^3.3.10",
- "webpack-dev-server": "^2.11.5",
- webpack-merge": "~4.1.0"




npm uninstall tslint codelyzer --force
npm uninstall url-loader resolve-url-loader webpack webpack-bundle-analyze webpack-cli webpack-dev-server extract-text-webpack-plugin webpack-merge bootstrap-loader html-webpack-plugin

npm uninstall  webpack-bundle-analyzer to-string-loader style-loader sass-loader loader-utils --force
npm uninstall html-loader awesome-typescript-loader css-loader expose-loader file-loader istanbul-instrumenter-loader --force
npm i ngx-treeview@latest --force
