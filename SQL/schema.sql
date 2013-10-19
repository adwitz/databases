DROP DATABASE chat;

CREATE DATABASE chat;

USE chat;

CREATE TABLE messages (
  messageid integer primary key, userid integer, username varchar(20), message varchar(10000), time datetime, room varchar(20)
);

CREATE TABLE users (
  userid integer primary key, username varchar(20)
);

CREATE TABLE friendships (
  userid integer, friend integer
);

insert into messages (messageid, userid, username, message, time, room) values (1, 1, 'bob', 'what up', '20130101', 'lobby');

/* You can also create more tables, if you need them... */

/*  Execute this file from the command line by typing:
 *    mysql < schema.sql
 *  to create the database and the tables.*/
