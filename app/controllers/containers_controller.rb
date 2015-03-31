# map to /containers
class ContainersController < DockerController
  reroute :get, %w(
    /ps
    /json
    /:id/export
    /:id/changes
    /:id/json
    /:id/top
    /:id/logs
    /:id/stats
    /:id/attach/ws
  )

  hijack :post, %w(
    /:id/attach
  )

  reroute :post, %w(
    /create
    /:id/kill
    /:id/pause
    /:id/unpause
    /:id/rename
    /:id/restart
    /:id/start
    /:id/stop
    /:id/wait
    /:id/resize
    /:id/copy
    /:id/exec
  )

  reroute :delete, %w( /:id )
end
