## KELP PRANAV ASSIGNMENT
#### The following solution has been provided keeping these points in mind:
1. Ensuring Scaling. Even though the CSV file entries might exceed 50000 ,  the solution will be still extremely fast i.e ,  it will scale up well for larger datasets.
2. The sanctity of the data as needed for the assignment has been maintained. 'additional_info' field will have within it proper structured data even for complex key which might have jsob as value type.
3. No third party libraries has been used i.e, only pre installed packages of node has been used for the solution . You would only need to install express and dotenv to run the solution . 
   -> npm i express dotenv
4. To run the application host your postgre DB. Ensure user has name , address , age and additional_info. Though I could have applied name = firstName + lastName logic within DB , but to save time and morover to have more
have control over sanctity of the data being passed to DB , I am manually combining firstName lastName and then passing that string as one name to user table.To create users table I used following query
  -> CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    age INT NOT NULL,
    address JSONB,
    additional_info JSONB
  );
5. Conversion to JSON. To validate the answer I am saving the json made from each csv row , in **converted.jsons** file.
6. To run the solution after ensuring express and dotenv are installed ,  with your hosted DB correct config in .env file , run
    -> node server.js
    -> Call endpoint http://localhost:PORT/process-csv which is a get request. Can be called from browser directly.
    -> Check converted.jsons for json conversion and check postgreDB if data was added or not.
    -> In the end the age classification table would be printed on the node console of the running server.js . We are fetching the age classification from POSTGRE as query , ensuring high latency.

#### ADDITIONAL INFO
1. As using Test Development approach I needed to have my own dataset , for that I have also coded generate_fake_data.js which uses faker.js to create fake csv of any numbers of row desired.
2. A sample.env has been provided. Clone that too and configure it to put your credentials directly.
