<script lang="ts">
  import * as UI from '$shared/components/ui';
  import * as D from '$shared/components/domain';
  import { currentUser, matches, meshes, perks, peers, sessions, badgesFor, threadFrom, getProfile } from '$shared/mock';
  const m = matches[0];
  const mesh = meshes[0];
</script>

<UI.Card>
  <D.MatchCard match={m} peer={getProfile(m.targetUserId)!} />
  <D.PeerCard peer={peers[0]} href="/u/{peers[0].id}" />
  <D.SessionCard session={sessions[0]} perspective="learning" />
  <D.PerkCard perk={perks[0]} balance={currentUser.karmaBalance} />
  <D.BadgeTile badge={badgesFor(currentUser)[0]} />
  <D.LeaderboardRow user={currentUser} rank={1} metric="karma" isMe />
  <D.MessageBubble message={threadFrom('s-008')[1]} isMine={false} />
  <D.MeshTriangle {mesh} a={getProfile(mesh.userAId)!} b={getProfile(mesh.userBId)!} c={getProfile(mesh.userCId)!} />
  <D.PrototypeBanner what="Video call" detail="No WebRTC here." />
  <UI.Table columns={[{ key: 'name', header: 'Name' }]} rows={peers.slice(0,2)} rowKey={(r) => r.id}>
    {#snippet cell(row, key)}{row.name}{/snippet}
  </UI.Table>
</UI.Card>
