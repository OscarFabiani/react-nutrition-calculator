
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';




//API key: 5iIK49BdqtpcdNs7c4x9B7g6guq7saZaWOVdnn8j

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
        name: 'Protein',
        unit: 'grams',
        value: setNutrientValue(food.nutrients, 203),
        measurements: {},
      },
      {
        id: 204,
        name: 'Fat',
        unit: 'grams',
        value: setNutrientValue(food.nutrients, 204),
        measurements: {},
      },
      {
        id: 205,
        name: 'Carbs',
        unit: 'grams',
        value: setNutrientValue(food.nutrients, 205),
        measurements: {},
      },
    ]
  }
}


//This function is used to round a number 2 decimal places and seems to avoid issues with using Math.round and
//the toFixed() method.
const roundToTwo = (num) => {    
  return +(Math.round(num + "e+2")  + "e-2");
}
//NOTE: an alternative to this would simply be: Math.round(nutrient.value * grams) / 100


//URL for USDA food item:
const itemURL = 'https://api.nal.usda.gov/ndb/V2/reports?ndbno=04053&ndbno=04047&ndbno=01123&ndbno=16018&ndbno=16058&ndbno=15088&&type=f&format=json&api_key=5iIK49BdqtpcdNs7c4x9B7g6guq7saZaWOVdnn8j';

const foodNames = ['Olive oil', 'Coconut oil', 'Eggs', 'Chickpeas', 'Black beans', 'Sardines'];


class Calculator extends React.Component {
  state = {
    foodData: [],
    foodGrams: [0, 0, 0, 0, 0, 0],
    foodCals: [0, 0, 0, 0, 0, 0],
    foodProtein: [0, 0, 0, 0, 0, 0],
    foodFat: [0, 0, 0, 0, 0, 0],
    foodCarbs: [0, 0, 0, 0, 0, 0],
    expansions: [false, false, false, false, false, false],
    isLoading: false,
    error: null
  }

  updateTotals = (grams, index) => {
    const {foodData, foodGrams, foodCals, foodProtein, foodFat, foodCarbs} = this.state;

    const newFoodGrams = [
      ...foodGrams.slice(0, index),
      Number(grams),
      ...foodGrams.slice(index + 1)
    ];

    const newFoodCals = [
      ...foodCals.slice(0, index),
      grams * foodData[index].nutrients[0].value / 100,
      ...foodCals.slice(index + 1)
    ];

    const newFoodProtein = [
      ...foodProtein.slice(0, index),
      grams * foodData[index].nutrients[1].value / 100,
      ...foodProtein.slice(index + 1)
    ];

    const newFoodFat = [
      ...foodFat.slice(0, index),
      grams * foodData[index].nutrients[2].value / 100,
      ...foodFat.slice(index + 1)
    ];

    const newFoodCarbs = [
      ...foodCarbs.slice(0, index),
      grams * foodData[index].nutrients[3].value / 100,
      ...foodCarbs.slice(index + 1)
    ];

    this.setState ({
      foodGrams: newFoodGrams,
      foodCals: newFoodCals,
      foodProtein: newFoodProtein,
      foodFat: newFoodFat,
      foodCarbs: newFoodCarbs,
    })
  }

  toggleExpansion = (index) => {
    const {expansions} = this.state
    this.setState (prevState => {
      return {expansions: prevState.expansions[index] ? [
        ...expansions.slice(0, index),
        false,
        ...expansions.slice(index + 1)] : [
          ...expansions.slice(0, index),
          true,
          ...expansions.slice(index + 1)
        ]}
    })
  }

  componentDidMount() {
    this.setState({isLoading: true})

    fetch(itemURL)
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
    const {foodData, foodGrams, foodCals, foodProtein, foodFat, foodCarbs, expansions, isLoading, error} = this.state;
    
    const calcTotal = (nutrientArray) => roundToTwo(nutrientArray.reduce((t, g) => t + g, 0));

    const foodRenders = foodData.map((food, i) => {
      return (
        <Food
          key={i}
          index={i}
          name={foodNames[i]}
          nutrients={food.nutrients}
          grams={foodGrams[i]}
          updateTotals={this.updateTotals}
          isExpanded={expansions[i]}
          toggleExpansion={this.toggleExpansion}/>
      )
    })
    
    return (
      error ? <span>Something went wrong...{error.message}</span> :
      isLoading ? <span>Loading...</span> :
      <div>
        <div className='meal'>
          <span className='total'>Total Grams: {calcTotal(foodGrams)}</span>
          <span className='total'>Total Calories: {calcTotal(foodCals)}</span>
          <span className='total'>Total Protein: {calcTotal(foodProtein)} grams</span>
          <span className='total'>Total Fat: {calcTotal(foodFat)} grams</span>
          <span className='total'>Total Carbs: {calcTotal(foodCarbs)} grams</span>
        </div>
        <div className='foods'>
          {foodRenders}
        </div>
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

    const nutrientRenders = nutrients.map((nutrient, i) => {
      return (
          <li key={i} className='answer'>{`${nutrient.name}: ${roundToTwo(nutrient.value * (grams / 100))} ${nutrient.unit}`}</li>
      )
    })

    return (
      <div className='food'>
        <h3>{name}</h3>
        <div>
          <input  className='input' type='number' value={grams} onChange={this.handleChange}></input>
          <span>Grams</span>
        </div>
        <div>
          <li className='question' onClick={this.handleClick}>Details</li>
          {isExpanded && <ul>{nutrientRenders}</ul>}
        </div>
      </div>
    )
  }
}





ReactDOM.render(
  <Calculator />,
  document.getElementById('root')
);


//

//As of 4/15/19 I have created 2 methods to render data from an API food report. The first is to pull data from
//the report considering the format of the food report object and necessarily filtering the nested nutrient
//object using a local object of nutrient ID's and preferred names. The second is to create a custom food
//object from the API report when Fetching then writing the data display logic considering the custom object's
//format with no need for filtering through nutrients or addeding logic for displaying preffered names of
//nutrients (though it looks I'll still need either a local object or added logic to the custom object to
//display prefferred food names).

//As of now I'm not sure which of these methods will be best going forward. It looks like the second methods
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





//URL to JSON data for my github repos
//const url = 'https://api.github.com/users/oscarfabiani/repos';

//Formerly in componentDidUpdate of Accordian
/*
fetch(url)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return;
        }
      })
      .then(response => {
        //console.log('response', response)
        this.setState({
          data: response,
          isLoading: false
        })
      })
      .catch(error => {
        console.log('error: ', error);
        this.setState({error})
      })

*/

//Formerly in the render of Accordian
/*
const repoRenders = data.map((repo, i) => {
  //console.log('repo', repo)
  return (
    <Repo
      key={repo.id}
      index={i}
      name={repo.name}
      desc={repo.description}
      currentIndex={currentIndex}
      handleClick={this.handleClick}/>
  )
})
*/

/*
class Repo extends React.Component {
  handleClick = () => {
    const {index, handleClick} = this.props;
    handleClick(index);
  }
  render() {
    const {index, name, desc, currentIndex} = this.props;
    let current = currentIndex === index;
    return (
      <ul className='holder'>
        <li className='question'onClick={this.handleClick}>{name}</li>
        {current && <li className={current ? 'answer open' : 'answer'}>{desc}</li>}
      </ul>
    )
  }
}
*/
