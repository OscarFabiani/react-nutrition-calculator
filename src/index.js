import "react-app-polyfill/ie9";
import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import 'font-awesome/css/font-awesome.min.css';





//API key: 5iIK49BdqtpcdNs7c4x9B7g6guq7saZaWOVdnn8j


//Foods and id numbers:

//Eggs 01123
//Chickpeas 16058
//Black beans 16018
//Coconut oil 04047
//Olive oil 04053
//Sardines 15088




//This function checks if a nutrient exists in a food report. This is meant to be used when creating custom
//food objects from API food reports since some foods seem to ommitt certain key nutrients.
//NOTE: Another approach would be to vet each food making sure each had all of the key nutrients present (or
//limiting the key nutrients accordingly). Another approach would be to create logic that excludes any ommitted
//nutrients from the custom food objects (if more suitable for functionalitly).
const setNutrientValue = (nutrients, id) => {
  const nutrient = nutrients.find(nutrient => nutrient.nutrient_id === id);
  //Alterative value could be undefined (with no ternary),  null, 0, or something else depending on desired
  //functionality.
  return nutrient? nutrient.value : null;
}

const createFoodObjects = (foods) => {
  return foods.map(food => createFoodObject(food.food));
}

const createFoodObject = (food) => {
  return {
    id: food.desc.ndbno,
    name: food.desc.name,
    nutrients: [
      {
        id: 208,
        name: 'Calories',
        unit: 'kcals',
        value: setNutrientValue(food.nutrients, 208),
        measurements: {},
      },
      {
        id: 203,
        name: 'Protein(g)',
        unit: 'grams',
        value: setNutrientValue(food.nutrients, 203),
        measurements: {},
      },
      {
        id: 204,
        name: 'Fat(g)',
        unit: 'grams',
        value: setNutrientValue(food.nutrients, 204),
        measurements: {},
      },
      {
        id: 205,
        name: 'Carbs(g)',
        unit: 'grams',
        value: setNutrientValue(food.nutrients, 205),
        measurements: {},
      },
    ]
  }
}


//This function is used to round a number to 2 decimal places and seems to avoid issues with using Math.round and
//the toFixed() method.
//NOTE: an alternative to this would simply be: Math.round(nutrient.value * grams) / 100
const roundToTwo = (num) => {    
  return +(Math.round(num + "e+2")  + "e-2");
}


//URL for USDA food items:
const foodsURL = 'https://api.nal.usda.gov/ndb/V2/reports?ndbno=04053&ndbno=04047&ndbno=01123&ndbno=16018&ndbno=16058&ndbno=15088&&type=f&format=json&api_key=5iIK49BdqtpcdNs7c4x9B7g6guq7saZaWOVdnn8j';

//Object to replace lengthy food names from USDA database with preferred/concise food names
const foodNames = ['Olive oil', 'Coconut oil', 'Eggs', 'Chickpeas', 'Black beans', 'Sardines'];


class Calculator extends React.Component {
  state = {
    foodData: [],
    foodGrams: [0, 0, 0, 0, 0, 0],
    expansions: [false, false, false, false, false, false],
    isLoading: false,
    error: null
  }

  updateTotals = (grams, index) => {
    const {foodGrams} = this.state;
    this.setState ({
      foodGrams: [...foodGrams.slice(0, index), Number(grams), ...foodGrams.slice(index + 1)]
    })
  }

  toggleExpansion = (index) => {
    const {expansions} = this.state;
    const newExpansions = [...expansions.slice(0, index), !expansions[index], ...expansions.slice(index + 1)];
    this.setState ({
      expansions: newExpansions
    })
  }

  componentDidMount() {
    this.setState({isLoading: true})

    fetch(foodsURL)
    .then(result => {
      if (result.ok) {
        return result.json();
      } else {
        return;
      }
    })
    .then(result => {
      this.setState({
        foodData: createFoodObjects(result.foods),
        isLoading: false
      })
    })
    .catch(error => {
      console.log('error: ', error);
      this.setState({error})
    });
  }
  
  render() {
    const {foodData, foodGrams, expansions, isLoading, error} = this.state;
    
    return (
      error ? <span>Something went wrong...{error.message}</span> :
      isLoading ? <span>Loading...</span> :
      <div className='calculator'>
        <Meal
        foodData={foodData}
        foodGrams={foodGrams}
        />
        <Foods
        foodData={foodData}
        foodGrams={foodGrams}
        expansions={expansions}
        updateTotals={this.updateTotals}
        toggleExpansion={this.toggleExpansion}
        />
      </div>
    )
  }
}

class Meal extends React.Component {
  render () {
    const {foodData, foodGrams} = this.props;
    //const totalGrams = foodGrams.reduce((total, grams) => total + grams, 0);

    //Creates 6 arrays containing 4 values (1 for each nutrient) to be used for calculating totals
    const nutrientArrays = foodData.map((food, index) => {
      return food.nutrients.map(nutrient => {
        return nutrient.value * foodGrams[index] / 100;
      })
    });

    //Creates an array with 4 values representing nutrient totals
    const totals = [0, 1, 2, 3].map(index => nutrientArrays.reduce((total, array) => total + array[index], 0));

    return (
      <section className='meal-display'>
        <h1 className="title">Macronutrient Calculator</h1>
        <div className="meal-totals">
          <h2 className='totals-label'>Meal Totals:</h2>
          <div className='totals-table'>
            <div className='meal-nutrient-total'>
              <h3 className='total-column label'>Calories</h3>
              <h3 className='total-column amount'>: {roundToTwo(totals[0])}</h3>
            </div>
            <div className='meal-nutrient-total'>
              <h3 className='total-column label'>Protein(g)</h3>
              <h3 className='total-column amount'>: {roundToTwo(totals[1])}</h3>
            </div>
            <div className='meal-nutrient-total'>
              <h3 className='total-column label'>Fat(g)</h3>
              <h3 className='total-column amount'>: {roundToTwo(totals[2])}</h3>
            </div>
            <div className='meal-nutrient-total'>
              <h3 className='total-column label'>Carbs(g)</h3>
              <h3 className='total-column amount'>: {roundToTwo(totals[3])}</h3>
            </div>
          </div>
        </div>
        <p className="instructions">Enter amounts for foods and the meal totals automatically update!</p>
      </section>
    )
  }
}

class Foods extends React.Component {
  render() {
    const {foodData, foodGrams, expansions, updateTotals, toggleExpansion} = this.props;

    const foodRenders = foodData.map((food, i) => {
      return (
        <Food
          key={i}
          index={i}
          name={foodNames[i]}
          nutrients={food.nutrients}
          grams={foodGrams[i]}
          updateTotals={updateTotals}
          isExpanded={expansions[i]}
          toggleExpansion={toggleExpansion}/>
      )
    })
    return (
      <div className='foods'>
        {foodRenders}
      </div>
    )
  }
}

class Food extends React.Component {
  handleClick = () => {
    const {index, toggleExpansion} = this.props;
    toggleExpansion(index);
  }
  handleChange = (event) => {
    const {index, updateTotals} = this.props;
    updateTotals(event.target.value, index);
  }
  
  render() {
    const {name, nutrients, grams, isExpanded} = this.props;

    const iconClass = isExpanded ? "fa fa-sort-up icon up-icon" : "fa fa-sort-down icon down-icon";

    const nutrientRenders = nutrients.map((nutrient, i) => {
      return (
        <div key={i} className='food-nutrient-total'>
          <p className='food-column label'>{nutrient.name}</p>
          <p className='food-column amount'>: {roundToTwo(nutrient.value * (grams / 100))}</p>
        </div>
      )
    })

    return (
      <div className='food'>
        <h3 className='food-label'>{name}</h3>
        <div className="input-display">
          <input className='input' type='number' min='0' max='999' value={grams} onChange={this.handleChange}/>
          <span>(grams)</span>
        </div>
        <div className="details-display">
          <div className='details-label' onClick={this.handleClick}>
            <i className={iconClass}></i>
            <h4>Details</h4>
            <i className={iconClass}></i>
          </div>
          {isExpanded && <ul className="nutrient-list">{nutrientRenders}</ul>}
        </div>
      </div>
    )
  }
}





ReactDOM.render(
  <Calculator />,
  document.getElementById('root')
);



//STYLE

//As of 4/15/19 I have created 2 methods to render data from an API food report. The first is to pull data from
//the report considering the format of the food report object and necessarily filtering the nested nutrient
//object using a local object of nutrient ID's and preferred names. The second is to create a custom food
//object from the API report when Fetching then writing the data display logic considering the custom object's
//format with no need for filtering through nutrients or addeding logic for displaying preffered names of
//nutrients (though it looks I'll still need either a local object or added logic to the custom object to
//display prefferred food names).

//As of now I'm not sure which of these methods will be best going forward. It looks like the second method
//results in more lines of code but makes the components more concise and understandable. One method may prove
//preferrable over the other as I add secondary nutrients and increase functionality.





//These objects haven't been necessary yet.
/*
const nutrientIDs = [
  {
    name: 'Calories',
    id: 208
  }, 
  {
    name: 'Protein',
    id: 203
  },
  {
    name: 'Total Fat',
    id: 204
  },
  {
    name: 'Carbs "by difference"',
    id: 205
  }
]


const carbIDs = [
  {
    name: 'Total Dietary Fiber',
    id: 291
  },
  {
    name: 'Total Sugars',
    id: 269
  }
]

const fatIDs = [
  {
    name: 'Saturated Fat',
    id: 606
  },
  {
    name: 'Monosaturated Fat',
    id: 645
  },
  {
    name: 'Polyunsaturated Fat',
    id: 646
  },
  {
    name: 'Trans Fat',
    id: 605
  }
]
*/


//This function seems to be unnecessary due to it's complexity (currently using a function that creates a
//simpler object).
/*
//THIS FUNCTION LIKELY NEEDS TO BE REFACTORED TO INCLUDE NESTED ARRAYS OF OBJECTS FOR MAPPING (SIMILAR TO
//createSimpleObject()).
const createComplexFoodObject = (report) => {
  //console.log('report: ', report);
  return {
    id: report.desc.ndbno,
    name: report.desc.name,
    nutrients: {
      calories: {
        id: 208,
        name: 'Calories',
        unit: 'kcals',
        value: setNutrientValue(report.nutrients, 208),
        measurements: {},
      },
      protein: {
        id: 203,
        name: 'Protein',
        unit: 'grams',
        value: setNutrientValue(report.nutrients, 203),
        measurements: {},
      },
      fat: {
        id: 204,
        name: 'Total Fat',
        unit: 'grams',
        value: setNutrientValue(report.nutrients, 204),
        measurements: {},
      },
      carbs: {
        id: 205,
        name: 'Total Carbs',
        unit: 'grams',
        value: setNutrientValue(report.nutrients, 205),
        measurements: {},
      },
      allCarbs: {
        totalCarbs: {
          id: 205,
          name: 'Total Carbs',
          unit: 'grams',
          value: setNutrientValue(report.nutrients, 205),
          measurements: {},
        },
        fiber: {
          id: 291,
          name: 'Total Fiber',
          unit: 'grams',
          value: setNutrientValue(report.nutrients, 291),
          measurements: {},
        },
        sugars: {
          id: 269,
          name: 'Total Sugars',
          unit: 'grams',
          value: setNutrientValue(report.nutrients, 269),
          measurements: {},
        }
      },
      allFats: {
        totalFat: {
          id: 204,
          name: 'Total Fat',
          unit: 'grams',
          value: setNutrientValue(report.nutrients, 204),
          measurements: {},
        },
        satFat: {
          id: 606,
          name: 'Saturated Fat',
          unit: 'grams',
          value: setNutrientValue(report.nutrients, 606),
          measurements: {},
        },
        monoFat: {
          id: 645,
          name: 'Monosaturated Fat',
          unit: 'grams',
          value: setNutrientValue(report.nutrients, 645),
          measurements: {},
        },
        polyFat: {
          id: 646,
          name: 'Polyunsaturated Fat',
          unit: 'grams',
          value: setNutrientValue(report.nutrients, 646),
          measurements: {},
        },
        transFat: {
          id: 605,
          name: 'Trans Fat',
          unit: 'grams',
          value: setNutrientValue(report.nutrients, 605),
          measurements: {},
        }
      }
    }
  }
}
*/



//This logic is for displaying data from the API food report without creating a local custom object.
/*
//This was originally in the render method of Accordian
const foodRenders = foodData.map((food, i) => {
  //console.log('food', food);

  const nutrientData = food.nutrients.filter(nutrient => nutrientIDs.some(n => n.id === nutrient.nutrient_id))
  //console.log('nutrientData', nutrientData);

  return (
    <Food
      key={i}
      index={i}
      desc={food.desc}
      nutrients={nutrientData}
      currentIndex={currentIndex}
      handleClick={this.handleClick}/>
  )
})

class Food extends React.Component {
  handleClick = () => {
    const {index, handleClick} = this.props;
    handleClick(index);
  }
  render() {
    const {index, desc, nutrients, currentIndex} = this.props;
    let current = currentIndex === index;

    const nutrientRenders = nutrients.map((nutrient, i) => {
      const name = nutrientIDs.find(nid => nid.id === nutrient.nutrient_id).name;
      return (
        <ul key={i}>
          <li className='question' onClick={this.handleClick}>{name}</li>
          {current && <li className='answer'><ul>{`${nutrient.value}${nutrient.unit}'s`}</ul></li>}
        </ul>
      )
    })

    return (
      <div>
        <h1>{desc.name}</h1>
        <span>(per 100 grams)</span>
        {nutrientRenders}
      </div>
    )
  }
}
*/
