
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';




//API key: 5iIK49BdqtpcdNs7c4x9B7g6guq7saZaWOVdnn8j


//URL for USDA food item:
const itemURL = 'https://api.nal.usda.gov/ndb/V2/reports?ndbno=01123&type=f&format=json&api_key=5iIK49BdqtpcdNs7c4x9B7g6guq7saZaWOVdnn8j'

//URL for food search:
const searchURL = 'https://api.nal.usda.gov/ndb/search/?format=json&q=egg&ds=Standard%20Reference&sort=r&max=10&offset=0&api_key=5iIK49BdqtpcdNs7c4x9B7g6guq7saZaWOVdnn8j'


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









//URL to JSON data for my github repos
const url = 'https://api.github.com/users/oscarfabiani/repos';


//A component that displays JSON data as an accordian.
class Accordian extends React.Component {
  state = {
    data: [],
    foodData: [],
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
      .then(result => result.json())
      .then(result => {
        console.log(result);
        this.setState({
          foodData: result.foods[0].food
        })
      })
      .catch(err => {
        console.log('error: ', err)
      });
    fetch(url)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return;
        }
      })
      .then(response => {
        this.setState({
          data: response,
          isLoading: false
        })
      })
      .catch(error => {
        console.log(error);
        this.setState({error})
      })
  }
  render() {
    const {data, foodData, currentIndex, isLoading, error} = this.state;
    console.log(foodData);
    //console.log(data);
    console.log(foodData.nutrients);
    const repoRenders = data.map((repo, i) => {
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
    
    return (
      error ? <span>Something went wrong...{error.message}</span> :
      isLoading ? <span>Loading...</span> :
      <div>
        {isLoading ? <li style={{backgroundColor: 'red'}}>Loading...</li> : repoRenders}
      </div>
    )
  }
}

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


ReactDOM.render(
  <Accordian />,
  document.getElementById('root')
);


//CONTINUE INTEGRATING API INTO ACCORDIAN
