const fs = require('fs');
const { faker } = require('@faker-js/faker');

const file = fs.createWriteStream('large-data.csv');
file.write('id,name.firstName,name.lastName,age,address.line1,address.line2,address.city,address.state,gender,\n');

for (let i = 1; i <= 100000; i++) {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const age = 20 + Math.floor(Math.random()*70);
  const line1 = faker.lorem.lines(1);
  const line2 = faker.lorem.lines(1);
  const city = faker.lorem.lines(1).split(" ")[0]
  const state = faker.lorem.lines(1).split(" ")[0]
  const gender = Math.floor(Math.random()*2) % 2 == 0 ? 'Male' : 'Female';
  file.write(`${i},"${firstName}","${lastName}",${age},"${line1}","${line2}","${city}","${state}",${gender}\n`);
}

file.end();
console.log('CSV generated: large-data.csv');
