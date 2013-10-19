CREATE DATABASE chat;

USE chat;

CREATE TABLE messages (
  messageid integer primary key auto_increment, userid integer, username varchar(20), message varchar(10000), time datetime, room varchar(20)
);

CREATE TABLE users (
  userid integer primary key auto_increment, username varchar(20)
);

CREATE TABLE friendships (
  userid integer primary key, friend integer
);

/* You can also create more tables, if you need them... */

/*  Execute this file from the command line by typing:
 *    mysql < schema.sql
 *  to create the database and the tables.*/
