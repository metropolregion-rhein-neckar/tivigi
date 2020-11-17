# Table of Contents
  - 1.) [Tivigi Release Announcement](#1-tivigi-release-announcement)
  - 2.) [What is Tivigi?](#2-what-is-tivigi)
  - 3.) [About the name](#3-about-the-name)
  - 4.) [License](#4-license)
  - 5.) [The Tivigi philosophy](#5-the-tivigi-philosophy)
    - 5.1.) [Tivigi is *not* a configurable out-of-the-box application.](#51-tivigi-is-not-a-configurable-out-of-the-box-application)
    - 5.2.) [Tivigi does *not* follow a "core and modules" architecture.](#52-tivigi-does-not-follow-a-core-and-modules-architecture)
    - 5.3.) [Tivigi is front-end / browser only](#53-tivigi-is-front-end--browser-only)
    - 5.4.) [Tivigi makes heavy use of component reuse and composition](#54-tivigi-makes-heavy-use-of-component-reuse-and-composition)
    - 5.5.) [Tivigi is strongly focused on declarative (i.e. Vue.js template based, HTML-like) coding](#55-tivigi-is-strongly-focused-on-declarative-ie-vuejs-template-based-html-like-coding)
  - 6.) [Getting Started](#6-getting-started)
    - 6.1.) [What do I *need* to know?](#61-what-do-i-need-to-know)
    - 6.2.) [What would be *valuable* to know?](#62-what-would-be-valuable-to-know)
    - 6.3.) [About single-page JavaScript applications](#63-about-single-page-javascript-applications)
    - 6.4.) [About Vue.js](#64-about-vuejs)
      - 6.4.1.) [What are Vue.js components?](#641-what-are-vuejs-components)
      - 6.4.2.) [What is Vue.js reactivity?](#642-what-is-vuejs-reactivity)
    - 6.5.) [About TypeScript](#65-about-typescript)
    - 6.6.) [About toolchain complexity](#66-about-toolchain-complexity)
    - 6.7.) [Setting up a development environment](#67-setting-up-a-development-environment)
      - 6.7.1.) [Software prerequisites to install](#671-software-prerequisites-to-install)
      - 6.7.2.) [Cloning the GitHub repository](#672-cloning-the-github-repository)
      - 6.7.3.) [Downloading dependencies with npm](#673-downloading-dependencies-with-npm)
    - 6.8.) [A look into the Tivigi source folder](#68-a-look-into-the-tivigi-source-folder)
    - 6.9.) [Running the sample application](#69-running-the-sample-application)
  - 7.) [Diving into the code](#7-diving-into-the-code)
    - 7.1.) [The root component and its template file](#71-the-root-component-and-its-template-file)
    - 7.2.) [A side note about the index.html file](#72-a-side-note-about-the-indexhtml-file)
    - 7.3.) [Parts of a Vue.js component](#73-parts-of-a-vuejs-component)
    - 7.4.) [Declarative vs imperative coding](#74-declarative-vs-imperative-coding)
    - 7.5.) [Template files vs. TypeScript files](#75-template-files-vs-typescript-files)
  - 8.) [Tutorial Step 1: My first map](#8-tutorial-step-1-my-first-map)
    - 8.1.) [Reactive HTML attributes](#81-reactive-html-attributes)
    - 8.2.) [Roles of the components in the first example](#82-roles-of-the-components-in-the-first-example)
    - 8.3.) [About "data components" in general](#83-about-data-components-in-general)
    - 8.4.) [The DataMap component](#84-the-datamap-component)
    - 8.5.) [The MapPanel component](#85-the-mappanel-component)
    - 8.6.) [The DataMapLayer component](#86-the-datamaplayer-component)
      - 8.6.1.) [The layerDef attribute and the layer definitions object structure](#861-the-layerdef-attribute-and-the-layer-definitions-object-structure)
      - 8.6.2.) [The layerId attribute](#862-the-layerid-attribute)
    - 8.7.) [The `<Data>` component with `name="homeExtent"`](#87-the-data-component-with-namehomeextent)
  - 9.) [Tutorial Step 2: Adding another layer and a layerdefs file](#9-tutorial-step-2-adding-another-layer-and-a-layerdefs-file)
    - 9.1.) [The `<DataJsonFetch>` component](#91-the-datajsonfetch-component)
    - 9.2.) [The second layer, and how it is different from the first](#92-the-second-layer-and-how-it-is-different-from-the-first)
  - 10.) [Tutorial Step 3: Adding a layer tree](#10-tutorial-step-3-adding-a-layer-tree)
    - 10.1.) [The `<LayerTree>` component](#101-the-layertree-component)
    - 10.2.) [The `<Modal>` component](#102-the-modal-component)
    - 10.3.) [The `<Superbutton>` component](#103-the-superbutton-component)
    - 10.4.) [Bidireactional data binding with `v-model` and `.sync`](#104-bidireactional-data-binding-with-v-model-and-sync)
  - 11.) [Tutorial Step 4: Adding a legend (list of active layers) and feature info tool](#11-tutorial-step-4-adding-a-legend-list-of-active-layers-and-feature-info-tool)
    - 11.1.) [The `<ActiveLayers>` component](#111-the-activelayers-component)
    - 11.2.) [The `<FeatureInfoTool>` component](#112-the-featureinfotool-component)
  - 12.) [Tutorial Step 5: Adding more features](#12-tutorial-step-5-adding-more-features)
    - 12.1.) [The `<LocationSearch>` component](#121-the-locationsearch-component)
    - 12.2.) [The `<MouseCoordinatesTool>` component](#122-the-mousecoordinatestool-component)
    - 12.3.) [The `<SetMapExtentTool>` component](#123-the-setmapextenttool-component)
  - 13.) [Troubleshooting](#13-troubleshooting)
    - 13.1.) [Problem: First setting of previously undefined variables in templates trigger component reload](#131-problem-first-setting-of-previously-undefined-variables-in-templates-trigger-component-reload)

# 1. Tivigi Release Announcement

We have something for you! After about one and a half year of development behind closed doors, we are proud to announce the immediate official release of our Tivigi software library as an open source project. Tivigi is a rapid development framework for modern, high-performance web front-ends with a strong focus on (but not limited to) geospatial information systems (GIS). Tivigi helps you to build fully customized, fast, reliable and user-friendly online GIS solutions faster than ever before. If you like, you can also ignore the GIS parts and use it for other types of web applications as well. It's flexible enough.

Tivigi is built on top of state-of-the-art, yet tried and true, well-established core technologies: The *TypeScript* programming language, The *Vue.js* user interface development framework and the *OpenLayers* web GIS library. Development and deployment is powered by the *npm* ecosystem and the *WebPack* building and bundling tool. Finally, some - but relatively few - other 3rd party JavaScript  dependencies are in the game as well.

# 2. What is Tivigi?

Tivigi is a software library that provides a collection of Vue.js components with a strong focus on, but not limited to, GIS applications. Tivigi ist mostly written in TypeScript, plus a couple of HTML and SCSS files to define the Vue.js component templates. Currently, Tivigi contains roughly 70 Vue.js components which cover a wide range of features of a modern web GIS application, like map panel, legend, layers list, and also more generic custom UI elements like collapsible areas and tree controls. Tivigi's GIS functionality is backed by OpenLayers, one of the world's most popular and feature-rich JavaScript web GIS libraries.

# 3. About the name

"Tivigi" stands for "TVG", pronounced as "Tee Vee Gee", which is an acronym for "TypeScript Vue.js GIS". Note that this is probably not the final name of the Framework. We are still searching for a new name that we like better.

# 4. License

Tivigi is released under the MIT license. You can find the license text below. In addition, there is also a separate license file (LICENSE.md) with the same text in the Tivigi package folder.

> Copyright 2020 Metropolregion Rhein-Neckar GmbH
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.




# 5. The Tivigi philosophy

This section provides a detailed introduction to the design decisions behind Tivigi. We strongly suggest to read it in order to understand Tivigi better, it could greatly help you to get started with Tivigi faster. Alternatively, you can skip the next section for now and directly continue with our beginner tutorials and example projects in the "Getting Started" section.


## 5.1. Tivigi is *not* a configurable out-of-the-box application.

In the german open source GIS community (and probably all over the world) there exist open source software projects (Masterportal, Wegue, ...?) which, on first look, appear similar to Tivigi and even (partially) use the same technological foundations (OpenLayers, Vue.js etc.). However, Tivigi follows a significantly different approach. Tivigi is NOT a ready-to-run web GIS application that can be customized through configuration files. Tivigi is a *software library*, and some actual code editing must be done to build something with it. It requires some effort to set up and understand the involved tools and processes, mainly the basics of how to use npm, WebPack, and how to write Vue.js component templates. For deeper customization and extension, a certain degree of knowledge about TypeScript/JavaScript, Vue.js, HTML and (S)CSS doesn't hurt either. In other words, Tivigi is a toolbox for software developers with a solid understanding of modern web front-end development. However, once you have this knowledge, working with Tivigi is fast and easy.

The "unique selling poing" of Tivigi is not primarily beginner-friendliness, but very high flexibility and efficiency for advanced users.


## 5.2. Tivigi does *not* follow a "core and modules" architecture.

Tivigi is a collection of loosely coupled Vue.js components. It's a decentralized architecture with no "core" and no "modules" or "extensions".  There is no global application state (unless you want to add one), and all components are more or less "created equal".

What exactly does "more or less" mean? Well: Effectively, some parts *do* depend on others for meaningful use. For example, one could say that the OpenLayers Map object is some sort of "core" on which many components depend and to which they are closely connected. Examples for such components are a map layer switcher or a map legend panel. They simply don't make sense without a map in the first place. However, you can have as many or few OpenLayers Map instances in your application as you wish, or even none at all (remember, Tivigi is not exclusively limited to GIS). So, while an OpenLayers Map instance does represent some sort of "core" in the Tivigi architecture, it's still not an obligatory, fixed or truly central, singular thing. This applies to everything in Tivigi, so one could also say that *everything* in Tivigi is a "module". Nothing *must* be used, and everything can be replaced or combined in a practically endless variety of ways.



## 5.3. Tivigi is front-end / browser only

This is not as much an explicit design philosophy/decision as the others, and it might perhaps change in the future, but it's still interesting and important to know: Tivigi does not contain any server-side components. It does also not absolutely *require* any 3rd-party server side components, apart from a web server that can deliver static JavaScript, CSS and HTML files. In the basic functionality of the framework, there is no Java, Python, PHP or other server-side environments involved at all. In practice, however, you'll probably want to use some server-side components. A web GIS platform usually requires a WMS/WFS service provider like GeoServer, and to enable your application to access web resources from external servers without browser CORS restrictions blocking your way, you'll need some sort of HTTP proxy on your server. There are also very interesting possibilities to integrate a content management system (CMS), you'll learn more on this later. However, here again: As much as decisions about such interrelations lie within the scope and reach of Tivigi, the framework does not force you to use *specific* solutions for these things, or to use them at all.


## 5.4. Tivigi makes heavy use of component reuse and composition

Tivigi is a collection of Vue.js components (plus several other utility classes and functions) which act as "building blocks" to create modern web applications. Some of these "building blocks" are very small and simple, other are bigger and more complex. In the same way as these components can be combined to build entire applications, many Tivigi components themselves are composed of other, smaller Tivigi components. As an example, let us look at the "Superbutton" component, a simple, yet versatile button which can also act as a checkbox and radiobutton. The Superbutton component is used by the "DropdownMenu" component, which again, is used as a UI element in even more complex components like the PopupMenu, which again, is part of the DropdownMenu, and so on. Such extensive composition hierarchies are one of the most fundamental principles of Tivigi. We always aim to break up functionality into as small pieces as reasonably possible, and try to avoid code duplication and redundancies. This has several benefits:

- It keeps the code base small, which minimizes download times and memory footprint.
- A small code base and widespread reuse of the same pieces makes the structure of the library and applications easier to navigate and understand.
- Code reuse also minimizes the amount of bugs. A bugfix, an added feature or another type of improvement can have positive effects on many different parts of an application, namely in all places where the affected component is used.
- Last but not least, intensive component reuse also increases consistency in UI behavior and the overall "look and feel" of an application.



## 5.5. Tivigi is strongly focused on declarative (i.e. Vue.js template based, HTML-like) coding

In Vue.js, so-called *templates* play a very central role. A Vue.js template is a piece of code which defines the HTML output of a component. The template code itself is not pure HTML, but a sort of "extended HTML" which is automatically translated to pure HTML by Vue.js. It is based on the basic syntax and elements of HTML, but adds custom elements (represented by  Vue.js components) and a set of Vue.js-specific attributes, so-called *directives*. Vue.js directives add the capability to control the output flow of the template. They define the logic how a template produces its final pure HTML result by adding constructs like conditional branching ("if") and "for"-loops, effectively "upgrading" HTML to a programming language. This allows developers to move parts of their application logic from JavaScript/TypeScript functions to template code. While this adds imperative aspects to the Vue.js template language, we still refer to templates as "declarative" in the following sections, as opposed to "classic" imperative code, i.e. JavaScript/TypeScript.

In the design and development process of our components, we pay a great deal of attention to maximize the possibilities of the "declarative" approach. Ideally, it should be possible to implement entire Tivigi-based applications as templates. This will always be limited, but we try to push these limits as far as reasonably possible. 

The main reason behind this is to enable the possibility to store Vue/Tivigi-based user interfaces and application parts in the form of template files in a web content management system (CMS) and load them into a Tivigi application at run-time. The general possibility to do this is provided by the Vue.js runtime template compiler, and part of the Vue.js library which is included in every Vue.js application and allows component templates to be compiled from their string representations and assigned to component instances at runtime.

This allows Vue.js-based applications to be extended with new UI parts "on the fly", without the need to recompile and upload their code, or even to reload/restart them in the browser. It combines the advantages of modern JavaScript "single page applications" (i.e. high interactivity and more or less "desktop-like" look and feel) with those of "traditional" solutions based on server-side HTML generation (easy integration of content from external sources like a database).


# 6. Getting Started

We have written a beginner tutorial which guides you through the process of creating your first simple Tivigi project. The tutorial is accompanied by a set of example applications, available on GitHub. The examples represent the states of progress of the tutorial at the end of each tutorial step. We recommend to work through the tutorial from the beginning. However, if you run into problems and want to check your code for correctness, or simply want to see how specific things are done, you can always look at the more advanced examples.

You can find the example applications here:

https://github.com/metropolregion-rhein-neckar/tivigi-examples


Note that Tivigi itself is a separate npm package. In order to work with the example projects, you do not need to clone the Tivigi repository separately. npm will automatically fetch Tivigi from GitHub as part of its dependency resolve process when you run *npm install*.

## 6.1. What do I *need* to know?

We have designed our tutorial to be as beginner-friendly as possible. However, due to the general complexity of the way how multiple technologies work together in Tivigi, a certain degree of web development experience is definitely helpful. 

As a *minimum*, you should bring with you the following skills:

- Basic understanding of world wide web technologies and their interrelations (What is a web application? What is HTML/CSS/JavaScript?)

- At least beginner level knowledge of reading and writing HTML and CSS. Some JavaScript knowledge doesn't hurt either, but is not absolutely required for the first steps.

- Basic knowledge of working with command line tools

## 6.2. What would be *valuable* to know?

*Optional*, but definitely very helpful knowledge includes:

- Basic understanding of TypeScript, Vue.js and OpenLayers
- Basic understanding of npm, WebPack and the Node.js-based web front end development ecosystem in general


## 6.3. About single-page JavaScript applications
Tivigi is a TypeScript/JavaScript web front end library. It is used to build so called *single-page JavaScript applications*. Unlike in, for example, typical PHP-, Python- or Java-based web applications, there is no server-side code involved in the provisioning of the general UI and application logic. The entire application is downloaded as a single block of JavaScript code when its web page is requested, and then it runs entirely on your computer. It is not very different from a "normal" application that is permanently installed on your system, with the two main diffferences that 1. you download it each time again when you use it and 2. it runs inside your browser.


## 6.4. About Vue.js

Vue.js is a JavaScript library which greatly simplifies the creation of JavaScript single page applications. It provides a foundation to create HTML-, Javascript- and CSS-based user interfaces in a very simple, elegant and consistent way. The main concepts of Vue.js are *components* and *reactivity*. 

### 6.4.1. What are Vue.js components?
Each "atomic" block of a Vue.js-based user interface is a component. A component consists of a JavaScript object that contains the component's logic, and an HTML-like mark-up fragment called "template", which defines the component's appearance in the rendered HTML document that represents the application UI.

The best way to think of Vue.js components is "custom HTML elements". This is really a very precise definition, since components are indeed added to the templates of other components in the form of HTML elements with the name of the respective component. This is a very powerful concept, since it allows developers to create complex, custom user interfaces with exactly the same principles as they do it with standard HTML since three decades. Other modern JavaScript UI foundation libraries like React and Angular use the same approach, which makes them very similar to Vue.js in many ways.

### 6.4.2. What is Vue.js reactivity?

*Reactivity*, also called "*data binding*" is the second cornerstone of Vue.js. The term refers to the technology implemented by Vue.js internally that can automatically synchronize HTML element attributes with JavaScript expressions like variables and function return values from the component's JavaScript data model. Typically, this happens in the direction from the JavaScript code to the HTML code, but in some cases it works in the other direction too.

An example: If you connect a variable in your JavaScript code with an HTML text input field through reactivity using the Vue.js-specific `v-model` attribute, then whenever the content of the variable is changed by JavaScript code, the input field's content is automatically synchronized, too, and also vice versa: The JavaScript variable is automatically updated with the latest value entered into the HTML input field by the user. 

This powerful feature greatly reduces the amount of "boilerplate" code required to build HTML user interfaces, so that developers can focus on the implementation of actual application logic.


## 6.5. About TypeScript

Tivigi is written in the *TypeScript* programming language. TypeScript is an extension of JavaScript, which means that each valid JavaScript progam is also a valid TypeScript program. TypeScript adds additional features to JavaScript, which help to greatly improve development productivity and code quality. Due to these additional features, web browser are unable to run TypeScript programs directly. This is where the TypeScript compiler comes into play. The TypeScript compiler translates TypeScript programs to normal JavaScript programs. Since TypeScript is a superset of JavaScript, every JavaScript library can directly be used in TypeScript projects without problems. Tivigi makes use of this, since it is mainly based on several popular JavaScript libaries like Vue.js and OpenLayers.

## 6.6. About toolchain complexity

The building of a modern single-page JavaScript application involves a daunting amount of tools and technologies working together. Here is a list of names of just the *major* technologies and products involved in the creation of a Tivigi application: HTML, JavaScript, TypeScript, CSS, SCSS, Vue.js, Openlayers, Node.js, npm, WebPack. 

Gladly, many of these tools actually exist to *simplify* the process. This is a somewhat ironic, seemingly paradoxical situation: A lot of complexity is in fact added to *reduce* the even much larger amount of complexity we would otherwise have to deal with.

But enough scaring. You will see that the actual process of getting your first Tivigi application to run involves just a few simple steps. There will be a lot of "magic" involved and you won't understand everything that is going on, but it still greatly helps to get started.


## 6.7. Setting up a development environment

### 6.7.1. Software prerequisites to install

In order to work through this tutorial, you need to have the following tools installed on your computer:

- *git*, to download source code repositories from GitHub
- *Node.js*, the server/desktop JavaScript runtime environment, required to run the build tools. We recommend the latest LTS version.
- *npm*, the *Node.js Package Manager*. It often comes included with a Node.js installation package.
- A text editor suitable for programming. We recommend Visual Studio code for its great TypeScript and general web dev support.
- Of course, a modern web browser. We recomend Mozilla Firefox, Microsoft Edge, Google Chrome or derived products.

You can find instructions for how to install these tools on the web. For Ubuntu 20.04, it's

```sudo apt install git nodejs```.


### 6.7.2. Cloning the GitHub repository

Open a terminal window, move your working directory to the location where you want to put the example projects, and enter the following command:

`git clone https://github.com/metropolregion-rhein-neckar/tivigi-tutorial-examples`



### 6.7.3. Downloading dependencies with npm

Change your command line working directory to the subfolder `example01_my_first_map/` within the repository folder that you have just cloned from GitHub. Inside, enter the follwing command:

```npm install```

This will download all JavaScript tools and libraries which are required to build the application, also called the "depencendies". This includes two different categories of software: The *first category* are *build tools* like the TypeScript compiler, the SCSS preprocessor and WebPack, which will run in your local *Node.js environment*. These tools are required to produce a "bundle" that contains your application and can later be deployed to a web server. The *second category* are JavaScript and TypeScript libraries which will become part of your application's code itself, like Vue.js, OpenLayer, and, of course, Tivigi. These will later run *in the web browser*. Packages from both categories are managed by npm and contain JavaScript or TypeScript code, but one should be aware of the difference.


## 6.8. A look into the Tivigi source folder

Now that we have downloaded our project's dependencies, including Tivigi, let's take a quick look at the Tivigi source folder. You wil find it in the subdirectory ```node_modules/tivigi/src/``` of the example project folder (generally, all dependencies managed by npm are saved in the ```node_modules``` folder).

The ```tivigi/src/``` folder contains a couple of files and subdirectories of its own:

- The folder *components* contains the source files of all of Tivigi's Vue.js components. Components are effectively custom HTML *elements*.

- The folder *directives* contains Tivigi's Vue.js *directives*. Directives are effectively custom HTML *attributes* (assignable to any HTML element).

- The folders *olVectorLayerStyling*, *treeUtil* and *util* contain "helper" functions and classes which are used by the components and directives.

- The file *components.scss* contains some standard Tivigi style definitions. The suffix "SCSS" means that the file is not standard CSS, but a form of extended CSS (with additional syntax features) that is compiled to normal CSS by the build tools. In addition to *components.scss*, most Tivigi components have their own SCSS style files that define styles which only apply to the respective component. *components.scss* contains "general" style defintions which apply to multiple components, or to standard HTML classes which are not part of a Tivigi Vue.js component.

- The *shims-\*.d.ts* files are required by the TypeScript compiler. The inform the compiler about the existence of various JavaScript modules it would otherwise not know about.


## 6.9. Running the sample application

Now that we have downloaded the dependencies, our application is ready to run. One of the installed dependencies is a web server which can run the application on our local machine for development purposes. We can start it with the following command, which the project folder as working directory:

```npm run serve```

The application is automatically compiled, and after a couple of seconds (depending on your computer's speed), it is accessible through a web browser at the URL `http://localhost:8080`. Note that 8080 is the default port which is used if it is available. If port 8080 is already occupied by another program, the next higher number (8081) is tried, and so on. In any case, the console output of the web server will tell you on with port it is listening.

If everything went according to plan, you should see an interactive world map in your browser window. The map should show the Rhine-Neckar Metropolitan Area in Germany - Tivigi's birth place :).


# 7. Diving into the code

Now, finally, things are getting serious! Let us take a closer look how the things you see in your browser are accomplished.


## 7.1. The root component and its template file
Start the text editor of your choice (we recommend Visual Studio Code for its great TypeScript and general web dev support) and open the file `<project root>/src/components/App/App.html`. As the file name says, it is a piece of HTML-like code that defines the application's UI. All the files within the "App" folder together define a Vue.js component. "App" is the *root component* of the application, which means that it sits at the top of the tree of nested components which typically makes up a Vue.js application. The file `App.html` is the App component's *template file*. Its syntax is based on HTML, but enhanced with some Vue.js-specific extensions, including the possibility to use other Vue.js components as custom HTML elements.

## 7.2. A side note about the index.html file
If you know HTML, you probably notice that the markup in the file does not represent a full, valid HTML document. It is just an HTML *fragment*, composed of a `div` element and its children. The rest of what defines a complete valid HTML document resides in the file `<project root>/public/index.html`. The output of the application's *root component* and its nested child components (i.e. the entire Vue.js application) is automatically *injected* into the `index.html` file at run time by Vue.js. The vast majority of development work happens in Vue.js component files, the `index.html` file remains very short and is rarely edited.

## 7.3. Parts of a Vue.js component
A Vue.js component typically consists of at least two files: The template (HTML fragment) file that defines the component's markup output, and a JavaScript or TypeScript file that defines the components program logic, i.e. how the component reacts to user input, what data is processes in which way, and so on. Often, a component also has its own SCSS style file, and sometimes additional resources like image files.


## 7.4. Declarative vs imperative coding
Typically, the development of a Vue.js application involves the creation/editing of three types of files: JavaScript/TypeScript code to define component/application logic, template files to define the HTML markup structure of the component/application's output, and SCSS/CSS files to define the visual appearance of the rendered HTML. 

However, Tivigi is designed in a way that most of even all of the development work required to build a simple application is limited to template files. This is called "declarative" coding, since it involves HTML-like markup, which does not contain program instructions in a strict sense. At least, this is true for plain, classic HTML. With the extended HTML of Vue.js templates, the story is a bit different, but we still refer to "declarative coding" when we talk about editing of templates, as opposed to "imperative coding" when editing "real" program (JavaScript/TypeScript) code. When writing a Tivigi application, imperative coding, i.e. editing of TypeScript code, is only required if you want to create new components or modify the behaviour of existing ones.

## 7.5. Template files vs. TypeScript files
Over the course of these tutorials, the App component's template file (`App.html`) is the only source code file in the project that will be modified. Nevertheless, we like to point out that there are two TypeScript source files which are not part of the Tivigi library and play an important role in the workings of the sample projects: One is the Application component's TypeScript logic file (`App.ts`), and the other is the application's (not the App component, but the whole program!) "entry point" of "bootstrap" file found under `<project root>/src/main.ts`. We won't take a closer look at these files now since no modifications to them are required to build a basic Tivigi application. For now, just keep in mind that they do important things nevertheless.


# 8. Tutorial Step 1: My first map

Let's get back to the code. If you haven't done it yet, open the file `<project root>/src/components/App/App.html` in your editor (again), and have a look at it. What we see is a combination of "traditional" HTML elements - actually just the `<div>` that wraps everything else - and custom HTML elements which are backed by Vue.js components: `<Data>`, `<DataMap>`, `<DataMapLayer>` and `<MapPanel>`.

## 8.1. Reactive HTML attributes
You see that the aforementioned custom elements have a colon in front of some of their attributes. The colon is Vue.js-specific syntax and specifies that the attribute's value is not the *actual* attribute string constant (as it always is in plain HTML), but should be interpreted as *JavaScript code*. That code is interpreted in the scope of the component's JavaScript/TypeScript object instance defined in the component's TypeScript (.ts) file. In most cases, the code string will just contain a member variable of the object, meaning the variable's value is passed as the attribute value. But more complex JavaScript expressions like method calls or constant like numbers, boolean symbols ("true"/"false") or "null" are possible too.

As an example: The expression `<MapPanel :map="local.map"/>` says that the component instance's member variable `this.local.map` (actually the member variable `map` of the component's member variable `local`, i.e. a two levels deep nesting hierarchy) should be passed as the value of the `<MapPanel>` element's `map` attribute. Without the colon, attributes are interpreted as constant strings just like in plain HTML.

The described mechanism is tightly interconnected with the *reactivity* feature of Vue.js. As explained before in the introduction paragraph about Vue.js reactivity, a colon-enabled attribute will automatically synchronize values from JavaScript expressions (variables, method calls etc.) in the scope of the component's instance object with the HTML. This feature is extensively used by Tivigi to connect different components through shared references to data objects.

A prominent example for this, which you will find all over most Tivigi applications, is the reference to a map object, used by most of Tivigi's GIS-related components. The map object is an OpenLayers Map instance. It is initially created by the `<DataMap>` component and stored as a member of the component's `local` variable, by the property name specified in the `<DataMap>` component's `name` attribute. The component member variable `local` is a container for all variables defined by the component's template. To refer to a member variable of `local` in the template code, you write `local.<variable name>`.

To recapitulate:

- `<DataMap name="map" />` creates an OpenLayers Map instance and stores is as a child property of the component instance's `local` property with the property name specified by the `name` attribute.

- Child properties of `local` can be accessed in template code through `local.<property name>`, just like *any* member variable or method of the component can be accessed in template code by their JavaScript expression.

The "container variable" `local` only exists to prevent accidential overwriting of predefined component member variables with user-defined ones. It is not a native feature of Vue.js, but was introduced by us as a convenience feature to support the high degree of declarative programming in Tivigi.

## 8.2. Roles of the components in the first example

We see several custom HTML elements, respectively Vue.js components, in the template code of the first example: `<Data>`,`<DataMap>`, `<DataMapLayer>` and `<MapPanel>`.

## 8.3. About "data components" in general
In Tivigi, components with names that begin with "Data" have *no visual representation*. They are called "data components". Their templates are empty, they don't display anything and do not support direct user interaction. Data components are *not a native Vue.js feature or concept*. There is no technical difference to "normal" components at all (other than the lack of a template). The concept of data components was defined by us and solely fulfills the purpose of providing a better understanding of a component's role.

## 8.4. The DataMap component

As already mentioned, the `<DataMap>` component instantiates an OpenLayers map object. It is important to understand that, in contrast to what one might intuitively assume, map objects, in their core sense, are *not visual objects* in OpenLayers and in Tivigi. A map object *does not display itself*. It only *holds the data* that defines a map, like the list of displayed layers, the cartographic projection, the current view extent, and so on. In order to add a map as a visual object to the UI, a `<MapPanel>` component is needed.

## 8.5. The MapPanel component

A `<MapPanel>` component represents the visualization and user interface of an OpenLayers map object. To display a map using a `<MapPanel>` object, an OpenLayers map object must first be created using a `<DataMap>` component, and then passed to the `<MapPanel>` through its `:map` attribute. The OpenLayers map object used in the example is named `local.map`.

## 8.6. The DataMapLayer component

When a map is initially added to an application, it is empty. A map needs map layers assigned to it in order to display something. In Tivigi, there are multiple ways to add a layer to a map. The most basic one is the `<DataMapLayer>` component. Being a data component, the `<DataMapLayer>` component itself does not display anything. Its role is to add a specified layer to the OpenLayers map instanced defined through its `:map` attribute. The `<DataMapLayer>` component has several other attributes. The most important ones are `layerDef` and `layerId`.

### 8.6.1. The layerDef attribute and the layer definitions object structure

The attribute `layerDef` expects a JavaScript object of a specific structure, called a *layer definitions object*, to be passed to it. Layer definitions objects support a large number of properties which will be documented separately. 

For now, you only need to understand that the JSON structure passed as the `layerDef` attribute defines the world map layer which is displayed on the map. In a typical more complex application, you would not hard-code layer definitions in a template, as it is done here for reasons of simplicity. Instead, layer definitions are typically provided as a separate JSON file and dynamically loaded into an application at run time. You will learn how to do this later in this tutorial.

### 8.6.2. The layerId attribute

You probably noticed that the `layerId` attribute appears as a key on the root level of the layer definitions object. The `layerId` attribute tells the `<DataMapLayer>` component which individual layer definition from the layer definitions object it should use. In this case, the layer definitions object contains only one layer definition, specified with the key "osm". However, layer definition objects can generally contain an unlimited number of different layer definitions. A typical Tivigi application uses at least one layer definitions file in which most or all of the map layers used in the application are defined.

## 8.7. The `<Data>` component with `name="homeExtent"`

This is a generic data component, i.e. it can hold any type of JavaScript object and does not have a special constructor and special attributes to inititalize it. It simply puts the variable psased to the `:value` attribute into the `local` container. In this case, the value is the initial extent of the map, i.e. the region of the world the map panel should show when the app is started. 

In this case, the object is an OpenLayers map extent array that covers the Rhine-Neckar Metropolitan Area. If you look at the `<MapPanel>` element, you see that it has an attribute named `:initialExtent` to which the object `local.homeExtent` is passed. This tells the `<MapPanel>` to set itself to the given map extent when it is instantiated.


# 9. Tutorial Step 2: Adding another layer and a layerdefs file

Let us now add a second layer and move the layer definitions for both layers to an external file. First, we need to get the second example up and running. If the development web server with example 1 is still running, focus the console window in which it runs and press `<ctrl> + <c>`. This will stop the server and make its port available again. We need it to run the second example.

Now move your command line working directory to `example02/` and run `npm install` and after that, `npm run serve`, just like you did it with the first example. Then open the app in your browser again by pointing it to `http://localhost:8080`.

You should see a similar picture as with the first example, but with an additional map layer that shows the 15 districts of the Rhine-Neckar Metropolitan Area. The districts layer is rendered semi-transparent so that the OSM background map shows through.

Now open the file `example02/src/App/App.html` in your editor and look at it. The most visible difference to the first example is that the layer definition JSON that was the value of the `<DataMapLayer>`'s `layerDef` attribute is gone. It is replaced by `local.layerDef`. What is `local.layerDef` and where does it come from? If you look further, you'll notice that it is defined by a newly added component: `<DataJsonFetch name="layerdef" url="layerdefs.json" />`. 


## 9.1. The `<DataJsonFetch>` component
`<DataJsonFetch>` is a component that requests a JSON resource from an URL in the background, parses the JSON once it is loaded and puts the result under the specified name into the `local` container. Vue.js reactivity "magic" ensures that the other components are automatically informed when the data is available, and update themselves. The file behind the URL configured in the `<DataJsonFetch>` component has the same structure as the hard-coded layer definition JSON in example 01, only with the addition of a second layer.

## 9.2. The second layer, and how it is different from the first
This second layer is added to the map through another `<DataMapLayer>` which was added to the code. It refers to the same layer definitions object as the first one, only the `:layerId` attribute is different. This second layer contains the Rhine-Neckar Metropolitan Area districts.

If you take a closer look at the layer definitions JSON file (accessible under http://localhost:8080/layerdefs.json), you'll notice that there are several significant differences. The first layer, the OpenStreetMap base map, is a *WMS* (OGC Web Map Service) layer, it is made of a grid of *raster images*. The second layer is a *GeoJSON* file. It contains *vector data* which is transformed into an image in the browser, by the OpenLayers library.


# 10. Tutorial Step 3: Adding a layer tree

So far, we have two layers on our map, but we can't toggle their visibility. This time, we'll add a layer switcher that allows us to add and remove layers to and from our map. As before, stop the development server running example 02, run `npm install` and `npm run serve` in the package folder of example 03, and open the app in your browser. You should see a new button labeled "Layers" at the top of the page, and a layer switcher panel popping up if you click that button.

A look into the `App.html` file of example 03 shows that three new components were added to accomplish this: A `<LayerTree>`, a `<Modal>` and a `<Superbutton>`. The two `<DataMapLayer>` components are gone.


## 10.1. The `<LayerTree>` component
They new components are connected in the following way:  The `<LayerTree>` is the component that displays a list of available layers with checkboxes or radiobuttons (depending on the configuration) to add and remove the layers to/from the map. With this functionality, the `<LayerTree>` component replaces the `<DataMapLayer>` components - with two important differences: First, the `<LayerTree>` allows us to add multiple layers with just one component, and second, that component also allows us to *remove* the layers from the map again if we want to do so.

## 10.2. The `<Modal>` component

The `<LayerTree>` is wrapped in a `<Modal>` component. Under the hood, the `<Modal>` is an HTML `<div>` that is "upgraded" with the following behaviours:

First, user interaction (i.e. mouse clicks or taps) *outside* of the `<Modal>` can be blocked. This is the "classic" meaning of a "modal dialog" in UI terminology. Though, in Tivigi, blocking of outside interaction is optional and disabled in this example.

Second, the `<Modal>` can be configured to automatically close/hide itself when the user clicks somewhere outside of it. This behavior is enabled in this example, with the exception that drag interactions (i.e. mouse button or finger down, hold and move) do not trigger the closing of the panel. This allows users to e.g. pan the map without hiding the `<Modal>`, but a single outside click or tap still closes it.

## 10.3. The `<Superbutton>` component

The `<Superbutton>` is an enhanced HTML `<button>` element. Unlike standard HTML `<button>` elements, the `<Superbutton>` can hold an "enabled/disabled" state, so that it can also serve as a checkbox-like control. Several special attributes to define its behaviour and emitted values, in combination with Vue's reactivity feature, make it a powerful UI element that can replace classic HTML buttons, checkboxes and also radio buttons in a simple and consistent way. In this example, the `<Superbutton>` is used to toggle the visibility of the `<Modal>` that contains the `<LayerTree>`. The connection between the `<Superbutton>` and the `<Modal>` is implemented through the `local.showLayerTree` variable, which is set as the `v-model` attribute of the `<Superbutton>` and as the `:show.sync` attribute of the `<Modal>`. 


## 10.4. Bidireactional data binding with `v-model` and `.sync`
The `v-model` attribute and the `.sync` suffix of the `<Modal>`'s `:show` attribute both implement *bidirectional* reactivity or *data binding* between the component attributes and the `local.showLayerTree` variable. We don't go into the details of `v-model` and `.sync` here, since they are standard parts of the Vue.js API. If you search the web for "vue.js v-model" and "vue.js attribute sync", you should find good explanations.


# 11. Tutorial Step 4: Adding a legend (list of active layers) and feature info tool

In this step, we are going to add two more typical features of most GIS applications: A list of active layers, including legend information (if available for a layer), and a feature info tool to query information from the active layers at coordinates selected by the user.

Adding these features is straightforward. They are implemented as components which are simply added to the template.

## 11.1. The `<ActiveLayers>` component

The `<ActiveLayers>` component displays a list of the layers that are currently added to the map. It also displays legend information for each layer, if available. Finally, it features buttons to trigger various actions for each layer, like e.g. setting the map view to the extent of the layer, or opening the layer's attributes table. The available options depend on the layer type and the configuration of the `<ActiveLayers>` component. Like for most of the components we have introduced so far, the most important attribute of the `<ActiveLayers>` component is `:map`, which is used to pass a reference to the OpenLayers map object of which the active layers are shown.
 

## 11.2. The `<FeatureInfoTool>` component

The `<FeatureInfoTool>` component adds a new type of user interaction to a map instance: If the user clicks or taps on a location on the map, the map's layers are queried for information about the feature(s) at the selected location, and the data is displayed in a pop-up window. Like with the feature info tool, the attribute `:map` is used to specify to which OpenLayers map object the `<FeatureInfoTool>` is connected.

Note that the OSM base map layer is not shown in the list of active layers even when it is activated in the layer switcher and visible on the map. This is because the base map layer is configured to not be visible on the list of active layers through the setting `showLegend : false` in the layer definitions file.


# 12. Tutorial Step 5: Adding more features

In this step, we will add another set of features: A location search tool, a widget that displays the geographic coordinates of the current mouse position on the map, and a button to reset the map view extent to its initial state.

## 12.1. The `<LocationSearch>` component

The `<LocationSearch>` component adds an input field to the app. When a user enter an address or a name of a place (town, street, point of interest etc.), the component queries the *OpenStreetMap Nominatim* API for the geographic coordinates or extent of that place. If successful, the map is centered on the returned location. Just like with most other GIS-related components, the most important attribute of `<LocationSearch>` is `:map`, which is again used to pass a reference to an OpenLayers map object.

## 12.2. The `<MouseCoordinatesTool>` component

The `<MouseCoordinatesTool>` component displays the geographic coordinates of the current location of the mouse pointer on the map. Again, it is connected with the map object through the `:map` attribute. Note that in oder to position the coordinates widget in the top right corner of the map panel, independent of the sizes and positions of the various elements of our fluid page layout, we need to wrap the `<MapPanel>` and `<MouseCoordinatesTool>` components into a `<div>` element with CSS `position:relative` set on that `<div>` and CSS `position:absolute` set on the `<MouseCoordinatesTool>`. However, this is a general CSS technique and not related specifically to Tivigi, so we don't go into details here.


## 12.3. The `<SetMapExtentTool>` component

The `<SetMapExtentTool>` component sets the view of the connected OpenLayers map object (`:map` attribute) to the extent passed as its `:extent` attribute, whenever the value of the variable passed as its `:tigger` attribute (usually a boolean) changes. The `<SetMapExtentTool>` component does not have its own user interface, it is completely controlled through its trigger variable, named `local.mapHomeTrigger` here.

To change the value of `local.mapHomeTrigger`, we have added another `<SuperButton>` component to our toolbar at the top of the page. This `<SuperButton>` has an `@click` event handler defined which negates the value of `local.mapHomeTrigger` (from `false` to `true` an back) each time the button is clicked. This triggers the `<SetMapExtentTool>`'s action.





# 13. Troubleshooting

In the "troubleshooting" section, we collect solutions to typical problems that users might run into during development with Tivigi.

## 13.1. Problem: First setting of previously undefined variables in templates trigger component reload

Solution: Make sure that you define and initialize each variable you use in a template with a `<Data>` component. Otherwise, if a previously undefined variable is set for the first time, a component reload is triggered, which resets the component to it initial state. This can be a very undesired effect in cases where users can change a component's state (e.g. opening/closing/moving child windows), since these changes will be unexpectedly undone.

