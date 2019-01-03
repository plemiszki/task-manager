class Api::CongressController < ActionController::Base

  def show
    endpoint = 'https://api.propublica.org/congress/v1/'
    states = %w{AK AL AR AZ CA CO CT DE FL GA HI IA ID IL IN KS KY LA MA MD ME MI MN MO MS MT NC ND NE NH NJ NM NV NY OH OK OR PA RI SC SD TN TX UT VA VT WA WI WV WY}

    senate_url = endpoint + '116/senate/members.json'
    senate_response = HTTParty.get(senate_url, headers: { "X-API-Key" => ENV["CONGRESS_KEY"] })
    senators = senate_response.parsed_response["results"][0]["members"].select { |member| member["in_office"] == true }
    senate_dems = senators.select { |member| ["D", "I"].include?(member["party"]) }
    senate_dems_up = senate_dems.select { |member| member["next_election"] == "2020" }
    senate_repubs = senators.select { |member| member["party"] == "R" }
    senate_repubs_up = senate_repubs.select { |member| member["next_election"] == "2020" }

    house_url = endpoint + '116/house/members.json'
    house_response = HTTParty.get(house_url, headers: { "X-API-Key" => ENV["CONGRESS_KEY"] })
    congressmen = house_response.parsed_response["results"][0]["members"].select { |member| member["in_office"] == true && states.include?(member["state"]) }
    house_dems = congressmen.select { |member| member["party"] == "D" }
    house_repubs = congressmen.select { |member| member["party"] == "R" }

    render json: {
      senate: {
        dems: senate_dems.length,
        repubs: senate_repubs.length,
        dems_up: senate_dems_up.length,
        repubs_up: senate_repubs_up.length
      },
      house: {
        dems: house_dems.length,
        repubs: house_repubs.length
      }
    }
  end

end
