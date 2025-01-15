const express = require('express');
const http = require('http');
const bookman = require("bookman");
const handlebars = require("express-handlebars");
const url = require("url");
const Discord = require("discord.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const handlebarshelpers = require("handlebars-helpers")();
const path = require("path");
const passport = require("passport");
const { Strategy } = require("passport-discord");
const session = require("express-session");
const client = new Discord.Client();
const randomString = require("random-string");
const db = (global.db = {});
  const ejs = require("ejs");
//




let ranks = ["script", "altin", "elmas", "hazir", "topluluk", "api","bdfd", "public", "secret"];
for (let rank in ranks) {
  db[ranks[rank]] = new bookman(ranks[rank]);
}


const IDler = {
  botID: "1118580463125147729",
  botToken: process.env.TOKEN,
  botSecret: process.env.SECRET,
  botCallbackURL: "https://levyscript.onrender.com/callback",
  sunucuID: "1235189205571866655",
  sunucuDavet: "https://discord.gg/F8vNGp3UV9",
  kodLogKanalı: "1329053123255472128",
  sahipRolü: "1263986203921743994",
  bdfd: "1263989195530305717",
  adminRolü: "1248029895276105729",
  kodPaylaşımcıRolü: "1264153637937221735",
  boosterRolü: "1264153860587393210",
  kodPaylaşamayacakRoller: ["1264153681708711957", "1264153681708711957"],
  hazırAltyapılarRolü: "1329053655424434176",
  hazırSistemlerRolü: "1329053801969356951",
  elmasKodlarRolü: "1263991984503128126",
  altınKodlarRolü: "1263992044964282438",
  normalKodlarRolü: "1263989322697277471",
  publicRolü: "1329053655424434176", // Public rolünün ID'si hazır altyapılar ile aynı
  secretRolü: "1263986203921743994" // Secret rolü, sahip rolü ile aynı
};
  
const app = express();


app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: false
  })
);
app.use(cookieParser());
app.engine(
  "handlebars",
  handlebars({
    defaultLayout: "main",
    layoutsDir: `${__dirname}/views/layouts/`,
    helpers: handlebarshelpers
  })
);

app.set("views",path.join(__dirname, "views"));
app.set("view engine", "handlebars");
app.use(express.static(__dirname + "/public"));
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

const scopes = ["identify", "guilds"];
passport.use(
  new Strategy(
    {
      clientID: IDler.botID,
      clientSecret: IDler.botSecret,
      callbackURL: IDler.botCallbackURL,
      scope: scopes
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile));
    }
  )
);
app.use(
  session({
    secret: "secret-session-thing",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.get(
  "/giris",
  passport.authenticate("discord", {
    scope: scopes
  })
);
app.get(
  "/callback",
  passport.authenticate("discord", {
    failureRedirect: "/error"
  }),
  (req, res) => {
    res.redirect("/");
  }
);
app.get("/cikis", (req, res) => {
  req.logOut();
  return res.redirect("/");
});
app.get("/davet", (req, res) => {
  res.redirect(IDler.sunucuDavet);
});

/* SAYFALAR BURADAN İTİBAREN */
app.get("/", (req, res) => {
  res.render("index", {
    user: req.user
  });
});

app.get("/script", (req, res) => {
  var data = db.script.get("kodlar");
  data = sortData(data);
      
  res.render("normal"
                    
, {
    user: req.user,
    kodlar: data
  });
});
app.get("/script/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 137,
          message:
            "Unfortunately, to view this category, you first need to join our Discord server / log in to the site. "
        }
      })
    );
  
  

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.script.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    res.render("kod", {
      user: req.user,
      kod: code
    });
  } else {
    res.redirect("/");
  }
});



//Bdfd baş
app.get("/bdfd76887", (req, res) => {
  var data = db.bdfd.get("kodlar");
  data = sortData(data);
      
  res.render("bdfd", {
    user: req.user,
    kodlar: data
  });
});
app.get("/bdfd/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 137,
          message:
            "Unfortunately, to view this category, you first need to join our Discord server / log in to the site."
        }
      })
    );
  
  

   var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.bdfd.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    let guild = client.guilds.cache.get(IDler.sunucuID);
    let member = req.user ? guild.members.cache.get(req.user.id) : null;
    if (
      member &&
      (member.roles.cache.has(IDler.bdfd) ||
        member.roles.cache.has(IDler.boosterRolü) ||
        member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.adminRolü))
    ) {
      res.render("kod", {
        user: req.user,
        kod: code
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            statuscode: 501,
            message: "You do not have permission to view this code."
          }
        })
      );
    }
  } else {
    res.redirect("/");
  }
});
//Bdfd son

// Admin Panel Route
app.get("/admin-panel", (req, res) => {
    // Sunucuyu alın
    const guild = client.guilds.cache.get("1235189205571866655"); // Sunucu ID'si
    if (!guild) {
        return res.status(500).send("Sunucu bulunamadı. Lütfen sunucu ID'sini kontrol edin.");
    }

    // Kullanıcı giriş kontrolü
    if (!req.user || !guild.members.cache.has(req.user.id)) {
        return res.redirect(
            url.format({
                pathname: "/hata",
                query: {
                    statuscode: 137,
                    message: "Bu sayfaya erişmek için Discord sunucusuna katılmanız ve giriş yapmanız gerekmektedir."
                }
            })
        );
    }

    const member = guild.members.cache.get(req.user.id);

    // Kullanıcının sahip rolüne sahip olup olmadığını kontrol edin
    if (!member.roles.cache.has("1263986203921743994")) { // Sahip Rolü ID
        return res.redirect(
            url.format({
                pathname: "/hata",
                query: {
                    statuscode: 403,
                    message: "Bu sayfaya erişim izniniz yok."
                }
            })
        );
    }

    // Tüm üyeleri ve rollerini alın
    const members = guild.members.cache.map(member => ({
        id: member.id,
        username: member.user.username,
        roles: member.roles.cache.map(role => ({
            id: role.id,
            name: role.name
        }))
    }));

    // Sunucudaki tüm rolleri alın
    const roles = guild.roles.cache.map(role => ({
        id: role.id,
        name: role.name
    }));

    // Yönetim panelini render edin
    res.render("admin-panel", { members, roles });
});

// Add Role API
app.post("/add-role", async (req, res) => {
    const { memberId, roleId } = req.body;

    try {
        const guild = client.guilds.cache.get("1235189205571866655"); // Sunucuyu alın
        if (!guild) {
            return res.status(500).json({ success: false, message: "Sunucu bulunamadı." });
        }

        const member = await guild.members.fetch(memberId); // Üyeyi alın
        const role = guild.roles.cache.get(roleId); // Rolü alın

        if (member && role) {
            await member.roles.add(role); // Rolü ekleyin
            return res.json({ success: true, message: `Rol ${role.name}, ${member.user.username} kullanıcısına başarıyla eklendi.` });
        }

        return res.json({ success: false, message: "Kullanıcı veya rol bulunamadı." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Rol eklenirken bir hata oluştu." });
    }
});

// Remove Role API
app.post("/remove-role", async (req, res) => {
    const { memberId, roleId } = req.body;

    try {
        const guild = client.guilds.cache.get("1235189205571866655"); // Sunucuyu alın
        if (!guild) {
            return res.status(500).json({ success: false, message: "Sunucu bulunamadı." });
        }

        const member = await guild.members.fetch(memberId); // Üyeyi alın
        const role = guild.roles.cache.get(roleId); // Rolü alın

        if (member && role) {
            await member.roles.remove(role); // Rolü kaldırın
            return res.json({ success: true, message: `Rol ${role.name}, ${member.user.username} kullanıcısından başarıyla kaldırıldı.` });
        }

        return res.json({ success: false, message: "Kullanıcı veya rol bulunamadı." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Rol kaldırılırken bir hata oluştu." });
    }
});

// Secret Kategorisi Ana Sayfa
app.get("/secret", (req, res) => {
  if (
    !req.user || // Kullanıcı giriş yapmamışsa
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id) // Sunucuda değilse
  ) {
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 137,
          message: "To view this category, you must first join our Discord server and log in to the site."
        }
      })
    );
  }

  let guild = client.guilds.cache.get(IDler.sunucuID);
  let member = guild.members.cache.get(req.user.id);

  // Eğer kullanıcı Secret rolüne sahipse erişim izni verilir (Boost olsa bile)
  if (member.roles.cache.has(IDler.secretRolü)) {
    var data = db.secret.get("kodlar");
    data = sortData(data);
    return res.render("secret", {
      user: req.user,
      kodlar: data
    });
  }

  // Secret rolü yoksa ve Boost rolü varsa erişim engellenir
  if (member.roles.cache.has(IDler.boosterRolü)) {
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 501,
          message: "You do not have permission to view this page."
        }
      })
    );
  }

  // Secret rolü yoksa erişim engellenir
  return res.redirect(
    url.format({
      pathname: "/hata",
      query: {
        statuscode: 501,
        message: "You do not have permission to view this page."
      }
    })
  );
});

// Secret Kategorisi ID Bazlı Sayfa
app.get("/secret/:id", (req, res) => {
  if (
    !req.user || // Kullanıcı giriş yapmamışsa
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id) // Sunucuda değilse
  ) {
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 137,
          message: "To view this category, you must first join our Discord server and log in to the site."
        }
      })
    );
  }

  let guild = client.guilds.cache.get(IDler.sunucuID);
  let member = guild.members.cache.get(req.user.id);

  // Eğer kullanıcı Secret rolüne sahipse erişim izni verilir (Boost olsa bile)
  if (member.roles.cache.has(IDler.secretRolü)) {
    var id = req.params.id;
    if (!id) req.redirect("/");
    let data = db.secret.get("kodlar");
    var code = findCodeToId(data, id);
    if (code) {
      return res.render("kod", {
        user: req.user,
        kod: code
      });
    } else {
      return res.redirect("/");
    }
  }

  // Secret rolü yoksa ve Boost rolü varsa erişim engellenir
  if (member.roles.cache.has(IDler.boosterRolü)) {
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 501,
          message: "You do not have permission to view this page."
        }
      })
    );
  }

  // Secret rolü yoksa erişim engellenir
  return res.redirect(
    url.format({
      pathname: "/hata",
      query: {
        statuscode: 501,
        message: "You do not have permission to view this page."
      }
    })
  );
});

// Public Kategorisi
app.get("/public", (req, res) => {
  var data = db.public.get("kodlar");
  data = sortData(data);
  res.render("public", {
    user: req.user,
    kodlar: data
  });
});

app.get("/public/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 137,
          message:
            "To view this category, you must first join our Discord server and log in to the site."
        }
      })
    );

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.public.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    let guild = client.guilds.cache.get(IDler.sunucuID);
    let member = req.user ? guild.members.cache.get(req.user.id) : null;
    if (
      member &&
      (member.roles.cache.has(IDler.publicRolü) ||
        member.roles.cache.has(IDler.boosterRolü) ||
        member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.adminRolü))
    ) {
      res.render("kod", {
        user: req.user,
        kod: code
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            statuscode: 501,
            message: "You do not have permission to view this code."
          }
        })
      );
    }
  } else {
    res.redirect("/");
  }
});

app.get("/altijjn", (req, res) => {
  var data = db.altin.get("kodlar");
  data = sortData(data);
  res.render("altin", {
    user: req.user,
    kodlar: data
  });
});
app.get("/altin/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 137,
          message:
            "Unfortunately, to view this category, you first need to join our Discord server / log in to the site."
        }
      })
    );

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.altin.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    let guild = client.guilds.cache.get(IDler.sunucuID);
    let member = req.user ? guild.members.cache.get(req.user.id) : null;
    if (
      member &&
      (member.roles.cache.has(IDler.altınKodlarRolü) ||
        member.roles.cache.has(IDler.boosterRolü) ||
        member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.adminRolü))
    ) {
      res.render("kod", {
        user: req.user,
        kod: code
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            statuscode: 501,
            message: "You do not have permission to view this code."
          }
        })
      );
    }
  } else {
    res.redirect("/");
  }
});
app.get("/elmas7766", (req, res) => {
  var data = db.elmas.get("kodlar");
  data = sortData(data);
  res.render("elmas", {
    user: req.user,
    kodlar: data
  });
});
app.get("/elmas/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 137,
          message:
            "Unfortunately, to view this category, you first need to join our Discord server / log in to the site."
        }
      })
    );

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.elmas.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    let guild = client.guilds.cache.get(IDler.sunucuID);
    let member = req.user ? guild.members.cache.get(req.user.id) : null;
    if (
      member &&
      (member.roles.cache.has(IDler.elmasKodlarRolü) ||
        member.roles.cache.has(IDler.boosterRolü) ||
        member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.adminRolü))
    ) {
      res.render("kod", {
        user: req.user,
        kod: code
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            statuscode: 501,
            message: "You do not have permission to view this code."
          }
        })
      );
    }
  } else {
    res.redirect("/");
  }
});
app.get("/hazir383o3", (req, res) => {
  var data = db.hazir.get("kodlar");
  data = sortData(data);
  res.render("hazir", {
    user: req.user,
    kodlar: data
  });
});
app.get("/hazir/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 137,
          message:
            "Unfortunately, to view this category, you first need to join our Discord server / log in to the site."
        }
      })
    );

  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.hazir.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    let guild = client.guilds.cache.get(IDler.sunucuID);
    let member = req.user ? guild.members.cache.get(req.user.id) : null;
    if (
      member &&
      (member.roles.cache.has(IDler.hazırSistemlerRolü) ||
        member.roles.cache.has(IDler.boosterRolü) ||
        member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.adminRolü))
    ) {
      res.render("kod", {
        user: req.user,
        kod: code
      });
    } else {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            statuscode: 501,
            message: "You do not have permission to view this code."
          }
        })
      );
    }
  } else {
    res.redirect("/");
  }
});
app.get("/topluluk", (req, res) => {
  var data = db.topluluk.get("kodlar");
  data = sortData(data);
  res.render("topluluk", {
    user: req.user,
    kodlar: data
  });
});

app.get("/topluluk/:id", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 137,
          message:
            "Unfortunately, to view this category, you first need to join our Discord server / log in to the site."
        }
      })
    );

  
  var id = req.params.id;
  if (!id) req.redirect("/");
  let data = db.topluluk.get("kodlar");
  var code = findCodeToId(data, id);
  if (code) {
    res.render("kod", {
      user: req.user,
      kod: code
    });
  } else {
    res.redirect("/");
  }
});
app.get("/profil/:id", (req, res) => {
  let id = req.params.id;
  let member = client.guilds.cache.get(IDler.sunucuID).members.cache.get(id);
  if (!member)
    res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 501,
          message: "No such person was found."
        }
      })
    );
  else {
    let perms = {
      altin:
        member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.adminRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.boosterRolü) ||
        member.roles.cache.has(IDler.altınKodlarRolü) ||
        member.roles.cache.has(IDler.hazırSistemlerRolü),
      elmas:
        member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.boosterRolü) ||
        member.roles.cache.has(IDler.elmasKodlarRolü) ||
        member.roles.cache.has(IDler.hazırSistemlerRolü),
      hazir:
        member.roles.cache.has(IDler.sahipRolü) ||
        member.roles.cache.has(IDler.adminRolü) ||
        member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
        member.roles.cache.has(IDler.boosterRolü) ||
        member.roles.cache.has(IDler.hazırSistemlerRolü) ||
        member.roles.cache.has(IDler.hazırAltyapılarRolü),
      destekçi: member.roles.cache.has(IDler.boosterRolü),
      yetkili:
         
        
        member.roles.cache.has(IDler.kodPaylaşımcıRolü), 
      admin: member.roles.cache.has(IDler.adminRolü),

      owner: member.roles.cache.has(IDler.sahipRolü)
    };
    res.render("profil", {
      user: req.user,
      member: member,
      avatarURL: member.user.avatarURL(),
      perms: perms,
      stats: db.api.get(`${member.user.id}`)
    });
  }
});

app.get("/sil/:rank/:id", (req, res) => {
  if (req.user) {
    let member = client.guilds.cache
      .get(IDler.sunucuID)
      .members.cache.get(req.user.id);
    if (!member) {
      res.redirect(
        url.format({
          pathname: "/hata",
          query: {
            statuscode: 502,
            message: "Only authorized personnel can do this."
          }
        })
      );
    } else {
      if (
        member.roles.cache.has(IDler.sahipRolü)
      ) {
        let id = req.params.id;
        if (!id) {
          res.redirect(
            url.format({
              pathname: "/hata",
              query: {
                statuscode: 504,
                message: "Please specify a code ID."
              }
            })
          );
        }
        let rank = req.params.rank;
        if (!rank) {
          res.redirect(
            url.format({
              pathname: "/hata",
              query: {
                statuscode: 504,
                message: "Please specify a code rank."
              }
            })
          );
        }
        var rawId = findCodeToId(db[rank].get("kodlar"), id);
        if (!rawId)
          res.redirect(
            url.format({
              pathname: "/hata",
              query: {
                statuscode: 504,
                message: "Such a code has never existed."
              }
            })
          );
        else {
          if (req.user) db.api.add(`${req.user.id}.silinen`, 1);
          db[rank].delete("kodlar." + rawId.isim);
          res.redirect("/");
        }
      } else {
        res.redirect(
          url.format({
            pathname: "/hata",
            query: {
              statuscode: 502,
              message: "You do not have the necessary permissions to view this page."
            }
          })
        );
      }
    }
  } else {
    res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 501,
          message: "You must log in to the site to view this page."
        }
      })
    );
  }
});




app.get("/ekimdkdmdp", (req, res) => {
  res.render("ekip", {
    user: req.user
  });
});




app.get("/videola7373r", (req, res) => {
  res.render("videolar", {
    user: req.user
  });
});



app.get("/sss", (req, res) => {
  res.render("sss", {
    user: req.user
  });
});


app.get("/yetkililerimiz", (req, res) => {
  res.render("ortaklar", {
    user: req.user
  });
});

app.get("/paylas", (req, res) => {
  if (
    !req.user ||
    !client.guilds.cache.get(IDler.sunucuID).members.cache.has(req.user.id)
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 138,
          message:
            "To share a code, you must first join our Discord server and log in to the site."
        }
      })
    );
  res.render("kod_paylas", {
    user: req.user
  });
});
app.post("/paylasim", (req, res) => {
  let guild = client.guilds.cache.get(IDler.sunucuID);
  let member = req.user ? guild.members.cache.get(req.user.id) : null;
  let rank = "topluluk";
  if (
    member &&
    IDler.kodPaylaşamayacakRoller.some(id => member.roles.cache.has(id))
  )
    return res.redirect(
      url.format({
        pathname: "/hata",
        query: {
          statuscode: 502,
          message: "You do not have the necessary permission to share a code."
        }
      })
    );
  if (
    member &&
    (member.roles.cache.has(IDler.sahipRolü) ||
      member.roles.cache.has(IDler.kodPaylaşımcıRolü) ||
      member.roles.cache.has(IDler.adminRolü))
  )
    rank = req.body.kod_rank;

  let auht = [];
  if (req.user) auht.push(req.user);
  let auth_arr = req.body.author.split(",");

  auth_arr.forEach(auth => {
    let user = client.users.cache.get(auth);
    auht.push(req.user);
  });

  let obj = {
    author: req.auth,
    isim: req.body.kod_adi,
    id: randomString({ length: 20 }),
    desc: req.body.desc,
    modules: req.body.modules.split(","),
    icon: req.user
      ? `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png`
      : `https://cdn.discordapp.com/icons/${IDler.sunucuID}/a_830c2bcfa4f1529946e82f15441a1227.jpg`,
    main_code: req.body.main_code,
    komutlar_code: req.body.komutlar_code,
    kod_rank: rank,
    k_adi: req.user.username,
    date: new Date(Date.now()).toLocaleDateString()
  };
  if (req.user) db.api.add(`${req.user.id}.paylasilan`, 1);
  db[obj.kod_rank].set(`kodlar.${obj.isim}`, obj);
  client.channels.cache.get(IDler.kodLogKanalı).send(
    new Discord.MessageEmbed()
    .setColor("RANDOM")
    .setFooter(client.guilds.cache.get(IDler.sunucuID).name, client.guilds.cache.get(IDler.sunucuID).iconURL({ dynamic: true, size: 2048}))
    .setTimestamp()
    .setAuthor("Sitede Bir  Kod Paylaşıldı!",client.user.avatarURL)
    .addField("Kod Bilgileri",`**Adı:** ${obj.isim} \n**Açıklaması:** ${obj.desc} \n**Paylaşan:** <@${req.user.id}>`)
    .addField("Kod Sayfası", `[Tıkla!](https://gangsgang.glitch.me/${obj.kod_rank}/${obj.id})`));
  res.redirect(`/${obj.kod_rank}/${obj.id}`);
  
  
  
  
});


function findCodeToId(data, id) {
  var keys = Object.keys(data);
  keys = keys.filter(key => data[key].id == id)[0];
  keys = data[keys];
  return keys;
}
function sortData(object) {
  var keys = Object.keys(object);
  var newData = {};
  var arr = [];
  keys.forEach(key => {// sup pothc :)
    arr.push(key);
  });
  arr.reverse();
  arr.forEach(key => {
    newData[key] = object[key];
  })
  return newData;
}

app.get("/hata", (req, res) => {
  res.render("hata", {
    user: req.user,
    statuscode: req.query.statuscode,
    message: req.query.message
  });
});

app.use((req, res) => {
  const err = new Error("Not Found");
  err.status = 404;
  return res.redirect(
    url.format({
      pathname: "/hata",
      query: {
        statuscode: 404,
        message: "Sayfa Bulunamadı"
      }
    })
  );
});

client.login(IDler.botToken);

client.on("ready", () => {
  const listener = app.listen(process.env.PORT, function() {
    console.log("Proje Hazır!");
  });
});
