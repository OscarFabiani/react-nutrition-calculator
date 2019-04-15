
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';




//API key: 5iIK49BdqtpcdNs7c4x9B7g6guq7saZaWOVdnn8j


//URL for USDA food item:
const itemURL = 'https://api.nal.usda.gov/ndb/V2/reports?ndbno=01123&type=f&format=json&api_key=5iIK49BdqtpcdNs7c4x9B7g6guq7saZaWOVdnn8j'

//URL for food search:
//const searchURL = 'https://api.nal.usda.gov/ndb/search/?format=json&q=egg&ds=Standard%20Reference&sort=r&max=10&offset=0&api_key=5iIK49BdqtpcdNs7c4x9B7g6guq7saZaWOVdnn8j'



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


/*
fetch(itemURL)
  .then(result => result.json())
  .then(result => {
    foodLog(result);
  })
  .catch(err => {
    console.log('error: ', err)
  });
  */



let foodLog = (foodResult) => {
  let food = foodResult.foods[0].food;
  let nutrients = food.nutrients.filter(nutrient => nutrientIDs.some(n => n.id === nutrient.nutrient_id))
  console.log(nutrients);

  logDesc(food);
  nutrients.forEach(nutrient => {
    logMeasures(nutrient);
  })
};


const logDesc = (food) => {
  console.log('Description:')
  console.log('foodGroup: ' + food.desc.fg);
  console.log('id: ' + food.desc.ndbno);
  console.log('name: ' + food.desc.name);
}

const logMeasures = (nutrient) => {
  console.log(`${nutrient.name}:`)
  console.log(`${nutrient.unit}'s per 100g ${nutrient.value}`);
  nutrient.measures.forEach(measure => {
    measure != null &&
      console.log(`${nutrient.unit}'s per ${measure.label}(${measure.eqv}${measure.eunit}): ${measure.value}`);
  })
}


const createFoodObject = (report) => {
  console.log(report)
  return {
    id: report.desc.ndbno,
    name: report.desc.name,
    nutrients: {
      calories: {
        id: 208,
        name: 'Calories',
        unit: 'kcals',
        value: report.nutrients.find(nutrient => nutrient.nutrient_id === 208).value,
        measurements: {},
      },
      protein: {
        id: 203,
        name: 'Protein',
        unit: 'grams',
        value: report.nutrients.find(nutrient => nutrient.nutrient_id === 203).value,
        measurements: {},
      },
      fat: {
        id: 204,
        name: 'Total Fat',
        unit: 'grams',
        value: report.nutrients.find(nutrient => nutrient.nutrient_id === 204).value,
        measurements: {},
      },
      carbs: {
        id: 205,
        name: 'Total Carbs',
        unit: 'grams',
        value: report.nutrients.find(nutrient => nutrient.nutrient_id === 205).value,
        measurements: {},
      }
    }
  }
}




//A component that displays JSON data as an accordian.
class Accordian extends React.Component {
  state = {
    data: [],
    foodData: [],
    customFoodData: [],
    currentIndex: -1,
    isLoading: false,
    error: null
  }
  handleClick = (i) => {
    this.setState (prevState => {
      return {currentIndex: prevState.currentIndex === i ? -1 : i}
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
      //console.log('result', [result.foods[0].food]);
      this.setState({
        foodData: [result.foods[0].food],
        customFoodData: [createFoodObject(result.foods[0].food)],
        isLoading: false
      })
    })
    .catch(error => {
      console.log('error: ', error);
      this.setState({error})
    });
  }
  render() {
    const {data, foodData, customFoodData, currentIndex, isLoading, error} = this.state;
    //console.log('data', data);
    console.log('foodData', foodData);
    console.log('customFoodData', customFoodData);

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
    
    return (
      error ? <span>Something went wrong...{error.message}</span> :
      isLoading ? <span>Loading...</span> :
      <div>
        {foodRenders}
      </div>
    )
  }
}

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
          {current && <li className={current ? 'answer open' : 'answer'}><ul>{`${nutrient.value}${nutrient.unit}'s`}</ul></li>}
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




ReactDOM.render(
  <Accordian />,
  document.getElementById('root')
);


//CONTINUE INTEGRATING API INTO ACCORDIAN




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
