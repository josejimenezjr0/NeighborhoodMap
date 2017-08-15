# Udacity Project Neighborhood Map

This project is a single page application featuring a map of a neighborhood. I added functionality to this map including highlighted locations, and third-party data about the locations for the nearest adapotable pet, thhrough the PetFinder API, based on the location zipcode.

## Setup

- Make sure you have the following installed:
    - git

- Clone the master fork from https://github.com/josejimenezjr0/NeighborhoodMap.git
- cd into the cloned repository and open the `main.html` file

## How to Run

The locaitons are loaded on the left and you can filter the list with the input box.
Clicking any of the location either by their marker or by their name kicks off an API call for the nearest adoptable pet based on that marker's zipcode.

#### Third-party API Call

I've decided to use the PetFinder API. The developer page is [here.](https://www.petfinder.com/developers/api-docs) The calls can be found in line 125 of the js file with the ajax call broken out at line 210.
I used the getRandom method and passed in a zipcode for limiting the search. As it stand now the zipcode functionality is not working on their end. I contacted them via e-mail and this was their response:
>Hi Jose, Thanks for reporting that issue with the API's pet.getRandom method.  It looks like you are using it correctly, but it seems like the results are just not being filtered by the zip code.  Please know that we are working on an updated version of the API but it's still in the early stages of development so we don't have an estimated release date.

### Code usage

I started with a template based off the Udacity Google Maps API course. From there I heavily modified and added in my functionality. I googled tons of things for reference but I'm not under the impression that I need to atrribute everything I looked up. I didn't copy any code directly but I did formulate things based on what I looked up online. I beleive that's exactly what you're supposed to do while learning but let me know if there's a standard that should be followed.

### Personal note

I'm not a fan of KnockoutJS. It's outdated (arguably dead) and while I understand it's diffucult to stay current in such a drastically changing field I would not have expected the project to mandate a specific framework. I can appreciate the need to know how to navigate through different frameworks and perhaps someone else's legacy code but for the project I didn't think it was worth it. Just some student feedback, I'd recommend making the framework a choice amongst two or three frameworks (so that grading it isn't a total nightmare).
