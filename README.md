# sucker

## Team Roles 
Brian Carreon: team member
Jon Miranda: team member
Mariel Sanchez: scrum master
Ryan Lee: team member

## Vision and Scope
Our application is a multiplayer game that anyone can play.

The game will have a database of “levels” that contains:

- a fill in the blank phrase
- the correct answer to the fill in the blank phrase
- an incorrect answer to the fill in the blank phrase

The goal of the game is to correctly guess the correct answer to the fill in the blank phrase. Before selecting a correct answer, the user will submit their own fill in the blank answer to try and gain points. 

## Point System

A user gains points if:

- another player selects their answer.
- the user select the correct answer.

A user loses points if:

- they select the database’s incorrect answer.

## Features

- Creating a Game
- Joining a Game
- Requesting a Game
- Inputting answer
- Selecting answer
- Showing correct answer
- Keeping score
- Adding people to the game

- 3-8 player game
- 3 rounds and 3 questions per round

### Stretch features
- computer generated lie
- team mode

## Rest API Info

- We’ll use an AWS ec2 instance running an Apache 
- We’ll use Firebase for our database because we want real time push notifications.
- We’ll use AngularJs to bind Firebase data to the DOM. 

## Low Fidelity Prototype
[https://drive.google.com/open?id=0B-R0bVChYMhiNmVQZ0lvbWkzUUE&authuser=0](https://drive.google.com/open?id=0B-R0bVChYMhiNmVQZ0lvbWkzUUE&authuser=0 "Google Drive")

## Use Case Diagram
![Use Case Diagram](http://40.media.tumblr.com/5a7775e1e403740027d169604d19b153/tumblr_njnk23ucUT1u8qvdso1_500.png "Use Case Diagram")

##UML Diagram
![UML Diagram](https://41.media.tumblr.com/59688653898793743f88a73c1c77116c/tumblr_njokeoJukn1u8qsgio1_1280.png "UML Diagram")

##Technical Overview
- Coding Language:
  We are coding in Javascript because we are most comfortable in this language and it handles all the front-end programming that we need for out application.
- Cloud Platform:
  We are using Amazon Web Service because it is the cloud service that we know the most experience with.
- API structure: 
  We are using Firebase as our API so that we can have multiple games going at once.
- Cloud database:
  We are also using Firebase as our database to hold our questions, current players, and to keep track of points 
- Code repository
  We are using Github because it allows the whole group to collaborate  on the code as well as view and control changes that have been made.

##Vertical Prototype

[sucker game prototype](http://ec2-52-10-81-77.us-west-2.compute.amazonaws.com/ "sucker game prototype")
[repo link](https://github.com/SuckerGame/sucker)
