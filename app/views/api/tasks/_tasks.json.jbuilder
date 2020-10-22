json.array! tasks do |hash|
  json.id hash['id']
  json.text hash['text']
  json.timeframe hash['timeframe']
  json.color hash['color']
  json.parentId hash['parent_id']
  json.duplicateId hash['duplicate_id']
  json.position hash['position']
  json.complete hash['complete']
  json.template hash['template']
  json.expanded hash['expanded']
  json.userId hash['user_id']
  json.jointId hash['joint_id']
  json.set! 'subtasks' do
    (hash['subtasks'].present? ? (json.partial! 'api/tasks/tasks', tasks: hash['subtasks']) : [])
  end
end
