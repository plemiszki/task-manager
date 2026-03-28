class ScrapeStreetEasy

  PROPERTY_TYPE_MAP = {
    'condo'         => 'condo',
    'co-op'         => 'co-op',
    'coop'          => 'co-op',
    'townhouse'     => 'townhouse',
    'single family' => 'single-family',
    'single-family' => 'single-family',
    'multi family'  => 'multi-family',
    'multi-family'  => 'multi-family',
    'multifamily'   => 'multi-family',
    'double family' => 'double-family',
    'singlefamily'  => 'single-family',
  }.freeze

  def initialize(url)
    @url = url
  end

  def call
    response = HTTParty.get(@url, headers: {
      'User-Agent'      => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept'          => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language' => 'en-US,en;q=0.9',
    })

    doc = Nokogiri::HTML(response.body)
    payload = assemble_flight_payload(doc)

    schema = extract_schema(payload)
    raise 'Could not find listing data on page' unless schema

    Rails.logger.info "ScrapeStreetEasy: schema: #{schema.inspect}"

    build_attributes(schema, payload)
  end

  private

  def assemble_flight_payload(doc)
    doc.css('script').each_with_object(+'') do |script, acc|
      next unless script.text.include?('__next_f.push([1,')
      match = script.text.match(/push\(\[1,("(?:[^"\\]|\\.)*")\]\)/)
      next unless match
      begin
        acc << JSON.parse(match[1])
      rescue JSON::ParserError
        # skip malformed chunks
      end
    end
  end

  def extract_schema(payload)
    start = payload.index('{"@context":"https://schema.org","@type":"')
    return nil unless start

    extract_json_object(payload, start)
  end

  def extract_json_object(str, start)
    depth = 0
    i = start
    in_string = false
    escape_next = false

    while i < str.length
      ch = str[i]

      if escape_next
        escape_next = false
      elsif ch == '\\'
        escape_next = true
      elsif ch == '"'
        in_string = !in_string
      elsif !in_string
        case ch
        when '{' then depth += 1
        when '}'
          depth -= 1
          return JSON.parse(str[start..i]) if depth == 0
        end
      end

      i += 1
    end
    nil
  rescue JSON::ParserError
    nil
  end

  def build_attributes(schema, payload)
    # address is a plain string in the schema
    street = schema['address'].to_s.strip

    apt_match  = street.match(/,?\s+(Apt|Unit|#)\s*(.+)$/i)
    apt_number = apt_match&.[](2)
    street_address = apt_match ? street[0, apt_match.begin(0)].strip : street

    label = street_address
    label = "#{label}, #{apt_number}" if apt_number

    neighborhood  = extract_string_field(payload, 'neighborhood') ||
                    extract_string_field(payload, 'areaName')

    price     = extract_field(payload, 'price') ||
                extract_field(payload, 'askingPrice')
    bedrooms  = extract_field(payload, 'bedrooms') ||
                extract_field(payload, 'beds')
    bathrooms = extract_field(payload, 'bathrooms') ||
                extract_field(payload, 'baths')
    area      = extract_field(payload, 'squareFeet') ||
                extract_field(payload, 'size')
    taxes     = extract_field(payload, 'taxes') ||
                extract_field(payload, 'annualTax')
    hoa_fees  = extract_field(payload, 'maintenanceFee') ||
                extract_field(payload, 'commonCharges')

    property_type = extract_type_from_payload(payload)

    {
      label:          label,
      street_address: street_address,
      apt_number:     apt_number,
      neighborhood:   neighborhood,
      status:         'available',
      price:          price.to_i,
      bedrooms:       bedrooms.to_i,
      bathrooms:      bathrooms.to_f,
      property_type:  property_type || 'condo',
      area:           area&.to_i,
      taxes:          taxes&.to_f,
      hoa_fees:       hoa_fees&.to_f,
      date_added:     Time.current,
      url:            @url,
    }
  end

  def extract_field(payload, field)
    match = payload.match(/"#{Regexp.escape(field)}":\s*([\d.]+)/)
    match&.[](1)
  end

  def extract_string_field(payload, field)
    match = payload.match(/"#{Regexp.escape(field)}"\s*:\s*"([^"]+)"/)
    match&.[](1)&.strip&.presence
  end

  def extract_type_from_payload(payload)
    match = payload.match(/"(?:buildingType|propertyType|listingType|homeType)"\s*:\s*"([^"]+)"/)
    raw = match&.[](1).to_s.downcase.strip
    PROPERTY_TYPE_MAP[raw] || PROPERTY_TYPE_MAP[raw.gsub(/\s+/, '')]
  end

end
