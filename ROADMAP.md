What needs to be done

Cli task that
- checks what was changed and only allow changes in providers folder
- check that only one file in the providers folder was changed
- get the user making the merge request (and its uid) and check that the user creating the merge request was registered by the tso its updating the data for on every chain
- check that the data that is submitted matches the schema 
- make tests for all of the cli commands 

Make good documentation on how to create files and submit them to the registry
- format files
- register with tso PK to registry contract
- create mr

Make some sort of easy to use dapp for registering the users ids
- use api https://docs.github.com/en/rest?apiVersion=2022-11-28 (https://api.github.com/users/<username>)

A series of videos and blog posts about what we are doing and what the end goal is

The dao needs:
- [ ] landing page + blog
- [x] dashboard that displays the data 
- [ ] documentation page on how to use the data
- [ ] the registry dapp (for adding github user ids)
- [ ] toolings/libs for this data



# In the future

Think about how to/if implement auto merging (the problem here is that one can update the cli yaml file)