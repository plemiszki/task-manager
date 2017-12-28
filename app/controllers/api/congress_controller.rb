class Api::CongressController < ActionController::Base

  def show
    endpoint = 'https://api.propublica.org/congress/v1/'
    states = %w{AK AL AR AZ CA CO CT DE FL GA HI IA ID IL IN KS KY LA MA MD ME MI MN MO MS MT NC ND NE NH NJ NM NV NY OH OK OR PA RI SC SD TN TX UT VA VT WA WI WV WY}

    senate_url = endpoint + '115/senate/members.json'
    senate_response = HTTParty.get(senate_url, headers: { "X-API-Key" => ENV["CONGRESS_KEY"] })
    senators = senate_response.parsed_response["results"][0]["members"].select { |member| member["in_office"] == true }
    senate_dems = senators.select { |member| ["D", "I"].include?(member["party"]) }.length
    senate_repubs = senators.select { |member| member["party"] == "R" }.length

    house_url = endpoint + '115/house/members.json'
    house_response = HTTParty.get(house_url, headers: { "X-API-Key" => "ed8XnbKcpPIOTblCL102ZAv7LW5dsETAcywdp49B" })
    congressmen = house_response.parsed_response["results"][0]["members"].select { |member| member["in_office"] == true && states.include?(member["state"]) }
    house_dems = congressmen.select { |member| member["party"] == "D" }.length
    house_repubs = congressmen.select { |member| member["party"] == "R" }.length

    render json: {
      senate: {
        dems: senate_dems,
        repubs: senate_repubs
      },
      house: {
        dems: house_dems,
        repubs: house_repubs
      }
    }
  end

end
