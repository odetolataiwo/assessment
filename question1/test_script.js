import http from 'k6/http';
import { group, sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

// A simple counter for http requests

export const requests = new Counter('http_reqs');

export const options = {
    thresholds: {
      http_reqs: ['count < 100'],
    },
};

  
export default function () {

    // function to generate a random date
    function randomDateGenerator(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    }

    var randomDate = randomDateGenerator(new Date(2020, 0, 1), new Date())
    var randomNumber = Math.floor(Math.random() * 21); // generate a random number from 1 to 20

    const baseURL = "http://::1:3000/api/v1" 
    // use this when you are running CI/CD
    // const baseURL = __ENV.BASE_URL

    group("When 'I call the '/isBusinessDay' endpoint'", () => {

        group("And 'I pass a valid date'", () => {
            const res = http.get(`${baseURL}/isBusinessDay?date=${randomDate.toISOString()}`);
      
            sleep(1);
    
            var weekDays = [1,2,3,4,5] // [Monday, Tuesday, Wednesday, Thursday, Friday]
            var result
            if (weekDays.includes(randomDate.getDay())) {
                result = true
            } else {
                result = false
            }
        
            check(res, {
                "Then 'the status should be 200'": (r) => r.status === 200,
            });
            var obj = JSON.parse(res.body)
            check(obj, {
                "Then 'the ok status should be true'": (r) => r.ok === true,
                "Then 'is a business day check should be valid'": (r) => r.results === result,
            });
        })

        group("I do not pass a date", () => {
            const res = http.get(`${baseURL}/isBusinessDay`);
      
            sleep(1);
    
            check(res, {
                "Then 'thestatus should be 200'": (r) => r.status === 200,
            });
            var obj = JSON.parse(res.body)
            check(obj, {
                "Then 'the ok status should be false'": (r) => r.ok === false,
                "Then 'is a business day checkshould be valid'": (r) => r.errorMessage === "A valid date is required",
            });
        })

    })
    

    group("When 'I call the '/settlementDate' endpoint'", () => {
        
        group("And 'I pass a valid date and delay'", () => {
            const res = http.get(`${baseURL}/settlementDate?initialDate=${randomDate.toISOString()}&delay=${randomNumber}`);
      
            sleep(1);

            
            check(res, {
                "Then 'the status code should be 200'": (r) => r.status === 200,
            });
            
            var obj = JSON.parse(res.body)
            check(obj, {
                "Then 'the ok status should be true'": (r) => r.ok === true,
                "Then 'the initialQuery should contain the correct initialDate'": (r) => r.initialQuery.initialDate === randomDate.toISOString(),
                "Then 'the initialQuery should contain the correct delay days'": (r) => r.initialQuery.delay === randomNumber.toString(),

                "Then 'the results contains businessDate'": (r) => r.results.businessDate !== null,
                "Then 'the results contains holidayDays'": (r) => r.results.holidayDays !== null,
                "Then 'the results contains totalDays'": (r) => r.results.totalDays !== null,
                "Then 'the results contains weekendDays'": (r) => r.results.weekendDays !== null,
            });
        })

        group("And 'I pass a valid date and delay as string'", () => {
            const res = http.get(`${baseURL}/settlementDate?initialDate=${randomDate.toISOString()}&delay=reer`);
      
            sleep(1);
    
            check(res, {
                "Then 'the status should be 500'": (r) => r.status === 500,
            });
        })

        group("And 'I do not pass a date and delay days'", () => {

            const res = http.get(`${baseURL}/settlementDate`);
    
            sleep(1);
    
            check(res, {
                "Then 'the status should be 200'": (r) => r.status === 200,
            });

            var obj = JSON.parse(res.body)
            check(obj, {
                "Then 'the ok status should be true'": (r) => r.ok === true,

                "Then 'the businessDate should be null'": (r) => r.results.businessDate === null,
                "Then 'the holidayDays should be zero'": (r) => r.results.holidayDays === 0,
                "Then 'the totalDays should be null'": (r) => r.results.totalDays === null,
                "Then 'the weekendDays should be zero'": (r) => r.results.weekendDays === 0,
            });
            
        })

    })
    
}